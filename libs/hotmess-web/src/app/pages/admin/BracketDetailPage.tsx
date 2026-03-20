import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Button,
  Breadcrumbs,
  Tabs,
  Tab,
  TabList,
  TabPanel,
  useToastContext,
} from '@true-tech-team/ui-components';
import {
  useSeason,
  useSeasonBrackets,
  useDivisions,
  useTeams,
} from '../../../hooks/useSupabaseQuery';
import {
  useBracketMatches,
  useAllBracketMatches,
  type BracketMatch,
} from '../../../hooks/useBracketMatches';
import { useBracketMutations, useBracketMatchMutations } from '../../../hooks/mutations';
import { buildAdminBreadcrumbs } from './utils';
import { BracketTree } from './components/bracket/BracketTree';
import { MatchScheduler, type MatchScheduleUpdate } from './components/bracket/MatchScheduler';
import {
  SeasonBracketConfig,
  type BracketScheduleConfig,
} from './components/bracket/SeasonBracketConfig';
import {
  DivisionCustomizer,
  type CustomizableDivision,
} from './components/bracket/DivisionCustomizer';
import { BracketExport } from './components/bracket/BracketExport';
import { MasterSchedule } from './components/bracket/MasterSchedule';
import { autoScheduleBracket } from './utils/bracketScheduling';
import { calculateSeeding } from './utils/bracketGeneration';
import {
  computeTimeSlots,
  computeSlotsNeeded,
  DEFAULT_BUFFER_MINUTES,
} from './utils/timeSlotComputation';
import {
  assignDivisionLetters,
  assignGameIds,
  type MatchWithGameId,
} from './utils/divisionLettering';
import adminStyles from './AdminPages.module.scss';
import detailStyles from './BracketDetailPage.module.scss';

const formatBracketType = (type: string) =>
  type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

export function BracketDetailPage() {
  const { seasonId } = useParams();
  const { data: season, loading } = useSeason(seasonId);
  const { data: seasonBrackets, refetch: refetchBrackets } = useSeasonBrackets(seasonId);
  const { data: divisions } = useDivisions(seasonId);
  const { data: allTeams } = useTeams();
  const mutations = useBracketMutations();
  const matchMutations = useBracketMatchMutations();
  const toast = useToastContext();
  const [generating, setGenerating] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<BracketMatch | null>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [pendingAutoSchedule, setPendingAutoSchedule] = useState(false);

  // Collect all bracket IDs for fetching all matches
  const allBracketIds = useMemo(() => seasonBrackets?.map((b) => b.id) || [], [seasonBrackets]);

  // Fetch ALL matches across all brackets
  const { data: allMatchesRaw, refetch: refetchAllMatches } = useAllBracketMatches(allBracketIds);

  // Also keep per-bracket fetch for detecting if brackets exist
  const firstBracketId = seasonBrackets?.[0]?.id;
  const { data: firstBracketMatches, refetch: refetchFirstMatches } =
    useBracketMatches(firstBracketId);

  const refetchMatches = async () => {
    await Promise.all([refetchFirstMatches(), refetchAllMatches()]);
  };

  // Extract sport config from season data
  const sportConfig = season?.leagues?.sports?.config as Record<string, unknown> | undefined;
  const gameDurationFromSport = (sportConfig?.gameDurationMinutes as number) || 60;
  const firstGameTimeFromSeason = (season?.schedule_config?.firstGameTime as string) || '09:00';
  const tournamentDate = season?.season_end_date || '';

  // Schedule configuration state
  const [scheduleConfig, setScheduleConfig] = useState<BracketScheduleConfig>({
    playAreas: ['Field 1', 'Field 2', 'Field 3'],
    tournamentDate,
    timeSlots: [],
    firstGameTime: '09:00',
    gameDurationMinutes: 60,
    bufferMinutes: DEFAULT_BUFFER_MINUTES,
  });

  // Division order state (for letter assignment — configurable in edit screen)
  const [divisionOrder, _setDivisionOrder] = useState<string[] | null>(null);

  // Sync season/sport data into scheduleConfig when it loads
  useEffect(() => {
    if (!season) {
      return;
    }
    setScheduleConfig((prev) => ({
      ...prev,
      tournamentDate: prev.tournamentDate || tournamentDate,
      firstGameTime: firstGameTimeFromSeason,
      gameDurationMinutes: gameDurationFromSport,
      playAreas: season.venues?.play_areas?.length ? season.venues.play_areas : prev.playAreas,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [season?.id]);

  // Division state for customization
  const [customDivisions, setCustomDivisions] = useState<CustomizableDivision[] | null>(null);

  const divisionsWithTeams: CustomizableDivision[] = useMemo(() => {
    if (customDivisions) {
      return customDivisions;
    }
    return (
      divisions?.map((div) => ({
        id: div.id,
        name: div.name,
        teams:
          allTeams
            ?.filter((t) => t.division_id === div.id)
            .map((t) => ({
              id: t.id,
              name: t.name,
              wins: t.wins || 0,
              losses: t.losses || 0,
              ties: t.ties || 0,
            })) || [],
      })) || []
    );
  }, [divisions, allTeams, customDivisions]);

  const handleDivisionsChange = (updated: CustomizableDivision[]) => {
    setCustomDivisions(updated);
  };

  const hasMatches = (firstBracketMatches?.length ?? 0) > 0;
  const bracketFormat = seasonBrackets?.[0]?.type || '';

  // Debug: log bracket data state
  console.warn('[BracketDetailPage] state:', {
    seasonId,
    bracketCount: seasonBrackets?.length ?? 0,
    bracketIds: allBracketIds,
    allMatchesRawCount: allMatchesRaw?.length ?? 0,
    firstBracketMatchesCount: firstBracketMatches?.length ?? 0,
    hasMatches,
    bracketFormat,
    viewMode,
    scheduleConfig,
  });
  if (allMatchesRaw && allMatchesRaw.length > 0) {
    console.warn(
      '[BracketDetailPage] all matches:',
      allMatchesRaw.map((m) => ({
        id: m.id,
        bracket_id: m.bracket_id,
        round: m.round,
        position: m.position,
        team1: m.team1?.name ?? m.team1_id ?? 'none',
        team2: m.team2?.name ?? m.team2_id ?? 'none',
        scheduled_at: m.scheduled_at,
        play_area: m.play_area,
        winner_next: m.winner_next_match_id,
      }))
    );
  }

  // Step A: compute total matches needed (no dependency on timeSlots)
  const matchesInfo = useMemo(() => {
    let totalMatchesNeeded = 0;
    const perDivision: Array<{ name: string; teams: number; matches: number }> = [];

    for (const div of divisionsWithTeams) {
      const teamCount = div.teams.length;
      let matchCount = 0;
      if (bracketFormat === 'round_robin') {
        matchCount = (teamCount * (teamCount - 1)) / 2;
      } else {
        matchCount = teamCount > 0 ? teamCount - 1 : 0;
      }
      totalMatchesNeeded += matchCount;
      perDivision.push({ name: div.name, teams: teamCount, matches: matchCount });
    }

    return { totalMatchesNeeded, perDivision };
  }, [divisionsWithTeams, bracketFormat]);

  // Step B: auto-compute time slots from matches + schedule config
  const computedTimeSlots = useMemo(() => {
    const slotsNeeded = computeSlotsNeeded(
      matchesInfo.totalMatchesNeeded,
      scheduleConfig.playAreas.length
    );
    return computeTimeSlots(
      scheduleConfig.firstGameTime,
      scheduleConfig.gameDurationMinutes,
      slotsNeeded,
      scheduleConfig.bufferMinutes
    );
  }, [
    matchesInfo.totalMatchesNeeded,
    scheduleConfig.playAreas.length,
    scheduleConfig.firstGameTime,
    scheduleConfig.gameDurationMinutes,
    scheduleConfig.bufferMinutes,
  ]);

  // Step C: sync computed time slots into scheduleConfig for downstream consumers
  useEffect(() => {
    const current = scheduleConfig.timeSlots;
    if (
      computedTimeSlots.length !== current.length ||
      computedTimeSlots.some((s, i) => s !== current[i])
    ) {
      setScheduleConfig((prev) => ({ ...prev, timeSlots: computedTimeSlots }));
    }
  }, [computedTimeSlots]); // eslint-disable-line react-hooks/exhaustive-deps

  // Step D: validation with available slots
  const validation = useMemo(() => {
    const availableSlots = scheduleConfig.playAreas.length * computedTimeSlots.length;
    return {
      availableSlots,
      totalMatchesNeeded: matchesInfo.totalMatchesNeeded,
      perDivision: matchesInfo.perDivision,
      isValid: availableSlots >= matchesInfo.totalMatchesNeeded,
    };
  }, [scheduleConfig.playAreas.length, computedTimeSlots.length, matchesInfo]);

  // Default to preview when brackets exist
  useEffect(() => {
    if (hasMatches) {
      setViewMode('preview');
    }
  }, [hasMatches]);

  // Auto-schedule after generation once match data arrives in state
  useEffect(() => {
    console.warn('[BracketDetailPage] auto-schedule effect:', {
      pendingAutoSchedule,
      matchCount: allMatchesRaw?.length ?? 0,
      computedTimeSlots,
      playAreas: scheduleConfig.playAreas,
      tournamentDate: scheduleConfig.tournamentDate,
    });
    if (!pendingAutoSchedule || !allMatchesRaw || allMatchesRaw.length === 0) {
      return;
    }
    if (computedTimeSlots.length === 0 || scheduleConfig.playAreas.length === 0) {
      console.warn(
        '[BracketDetailPage] auto-schedule skipped: no computed time slots or play areas'
      );
      return;
    }

    setPendingAutoSchedule(false);

    const startDate = new Date(scheduleConfig.tournamentDate);
    console.warn('[BracketDetailPage] running autoScheduleBracket with', {
      matchCount: allMatchesRaw.length,
      startDate: startDate.toISOString(),
      timeSlots: computedTimeSlots,
      playAreas: scheduleConfig.playAreas,
    });

    const scheduledUpdates = autoScheduleBracket(
      allMatchesRaw,
      startDate,
      computedTimeSlots,
      scheduleConfig.playAreas
    );

    console.warn('[BracketDetailPage] autoScheduleBracket result:', scheduledUpdates);

    if (scheduledUpdates.length > 0) {
      matchMutations
        .bulkUpdate(
          scheduledUpdates.filter((m) => m.id).map((m) => ({ id: m.id as string, data: m }))
        )
        .then(() => refetchMatches())
        .then(() => toast?.success(`Scheduled ${scheduledUpdates.length} matches!`))
        .catch((err) => console.error('Auto-schedule failed:', err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAutoSchedule, allMatchesRaw, computedTimeSlots]);

  // Build team seed maps per division
  const teamSeedMaps = useMemo(() => {
    const maps = new Map<string, Map<string, number>>();
    if (!allTeams || !seasonBrackets) {
      return maps;
    }

    for (const bracket of seasonBrackets) {
      const divisionId = bracket.division_id;
      const divTeams = allTeams
        .filter((t) => t.division_id === divisionId)
        .map((t) => ({
          id: t.id,
          name: t.name,
          wins: t.wins || 0,
          losses: t.losses || 0,
          ties: t.ties || 0,
          pointsFor: 0,
          pointsAgainst: 0,
        })) as Parameters<typeof calculateSeeding>[0];
      if (divTeams.length === 0) {
        continue;
      }

      const seeded = calculateSeeding(divTeams);
      const seedMap = new Map<string, number>();
      for (const team of seeded) {
        seedMap.set(team.id, team.seed);
      }
      maps.set(bracket.id, seedMap);
    }

    return maps;
  }, [allTeams, seasonBrackets]);

  // Division lettering
  const orderedBracketIds = useMemo(() => {
    if (divisionOrder) {
      return divisionOrder;
    }
    return allBracketIds;
  }, [divisionOrder, allBracketIds]);

  const divisionLetterMap = useMemo(
    () => assignDivisionLetters(orderedBracketIds),
    [orderedBracketIds]
  );

  // Build matches with game IDs for master schedule
  const allMatchesWithGameIds: MatchWithGameId[] = useMemo(() => {
    if (!allMatchesRaw || !seasonBrackets) {
      return [];
    }

    const matchesByBracket = new Map<string, BracketMatch[]>();
    const bracketIdToDivName = new Map<string, string>();

    for (const bracket of seasonBrackets) {
      const divName = bracket.divisions?.name || 'Division';
      bracketIdToDivName.set(bracket.id, divName);
      matchesByBracket.set(
        bracket.id,
        allMatchesRaw.filter((m) => m.bracket_id === bracket.id)
      );
    }

    return assignGameIds(matchesByBracket, bracketIdToDivName, divisionLetterMap);
  }, [allMatchesRaw, seasonBrackets, divisionLetterMap]);

  if (loading) {
    return (
      <div className={adminStyles.page}>
        <p>Loading bracket details...</p>
      </div>
    );
  }

  if (!season) {
    const notFoundBreadcrumbs = buildAdminBreadcrumbs([
      { label: 'Brackets', href: '/admin/brackets' },
      { label: 'Not Found' },
    ]);
    return (
      <div className={adminStyles.page}>
        <Breadcrumbs items={notFoundBreadcrumbs} separator="/" size="sm" />
        <p style={{ marginTop: '1rem' }}>Season not found.</p>
      </div>
    );
  }

  const seasonName = season.name || 'Untitled Season';
  const leagueName = season.leagues?.name;

  const breadcrumbs = buildAdminBreadcrumbs([
    { label: 'Brackets', href: '/admin/brackets' },
    { label: seasonName },
  ]);

  const handleGenerateBrackets = async () => {
    if (!seasonId) {
      return;
    }

    console.warn('[BracketDetailPage] handleGenerateBrackets called', {
      seasonId,
      scheduleConfig,
      divisionsWithTeams: divisionsWithTeams.map((d) => ({
        name: d.name,
        teamCount: d.teams.length,
      })),
    });

    setGenerating(true);
    try {
      await mutations.generateSeason({ season_id: seasonId });
      console.warn('[BracketDetailPage] generateSeason complete, refetching...');
      await Promise.all([refetchBrackets(), refetchMatches()]);
      console.warn('[BracketDetailPage] refetch complete');

      // Trigger auto-schedule via effect once match data arrives in state
      if (computedTimeSlots.length > 0 && scheduleConfig.playAreas.length > 0) {
        console.warn('[BracketDetailPage] setting pendingAutoSchedule=true');
        setPendingAutoSchedule(true);
      } else {
        console.warn(
          '[BracketDetailPage] skipping auto-schedule: computedTimeSlots or playAreas empty'
        );
      }

      toast?.success('Brackets generated for all divisions!');
    } catch (error) {
      console.error('Failed to generate brackets:', error);
      toast?.error('Failed to generate brackets. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveMatch = async (matchId: string, updates: MatchScheduleUpdate) => {
    await matchMutations.update(matchId, updates);
    await refetchMatches();
  };

  const showEditMode = viewMode === 'edit' || !hasMatches;
  const showPreviewMode = viewMode === 'preview' && hasMatches;

  return (
    <div className={adminStyles.page}>
      <Breadcrumbs items={breadcrumbs} separator="/" size="sm" />

      <div className={adminStyles.pageHeader}>
        <div>
          <h1 className={adminStyles.pageTitle}>{seasonName}</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            {bracketFormat
              ? `${formatBracketType(bracketFormat)} Tournament`
              : 'Tournament Brackets'}
            {leagueName && ` \u2014 ${leagueName}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {hasMatches && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'preview' ? 'edit' : 'preview')}
            >
              {viewMode === 'preview' ? 'Edit Configuration' : 'View Bracket'}
            </Button>
          )}
          {hasMatches && seasonBrackets && (
            <BracketExport
              seasonName={seasonName}
              tournamentDate={scheduleConfig.tournamentDate}
              sportName={season.leagues?.sports?.name || 'Sports'}
              brackets={seasonBrackets.map((b) => ({
                bracketId: b.id,
                divisionName: b.divisions?.name || 'Division',
                divisionLetter: divisionLetterMap.get(b.id) || '',
                matches: (allMatchesRaw || []).filter((m) => m.bracket_id === b.id),
                teamSeedMap: teamSeedMaps.get(b.id),
              }))}
              masterScheduleMatches={allMatchesWithGameIds}
              timeSlots={scheduleConfig.timeSlots}
            />
          )}
          {!hasMatches && (
            <Button
              variant="primary"
              onClick={handleGenerateBrackets}
              disabled={generating || !validation.isValid || divisionsWithTeams.length === 0}
            >
              {generating ? 'Generating...' : 'Generate Brackets'}
            </Button>
          )}
        </div>
      </div>

      {/* Edit / Configuration Mode */}
      {showEditMode && (
        <div style={{ marginTop: '2rem' }}>
          <SeasonBracketConfig config={scheduleConfig} onUpdate={setScheduleConfig} />

          <DivisionCustomizer
            divisions={divisionsWithTeams}
            onDivisionsChange={handleDivisionsChange}
          />

          {/* Validation Summary */}
          {divisionsWithTeams.length > 0 && (
            <div className={detailStyles.validationCard}>
              <h3 className={detailStyles.validationTitle}>Slot Availability</h3>
              <p className={detailStyles.validationSummary}>
                {scheduleConfig.playAreas.length} play area
                {scheduleConfig.playAreas.length !== 1 ? 's' : ''} &times;{' '}
                {scheduleConfig.timeSlots.length} time slot
                {scheduleConfig.timeSlots.length !== 1 ? 's' : ''} ={' '}
                <strong>{validation.availableSlots}</strong> available game slots.{' '}
                <strong>{validation.totalMatchesNeeded}</strong> matches needed across{' '}
                {divisionsWithTeams.length} division{divisionsWithTeams.length !== 1 ? 's' : ''}.
              </p>
              {!validation.isValid && validation.totalMatchesNeeded > 0 && (
                <p className={detailStyles.validationError}>
                  Not enough game slots for auto-scheduling. Add more play areas or time slots
                  before scheduling.
                </p>
              )}
              {validation.isValid && validation.totalMatchesNeeded > 0 && (
                <p className={detailStyles.validationSuccess}>Sufficient game slots available.</p>
              )}
              <div className={detailStyles.validationBreakdown}>
                {validation.perDivision.map((d) => (
                  <div key={d.name} className={detailStyles.validationRow}>
                    <span>{d.name}</span>
                    <span>
                      {d.teams} teams, {d.matches} matches
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generate button when editing existing brackets */}
          {hasMatches && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <Button variant="outline" onClick={() => setViewMode('preview')}>
                Back to Bracket Preview
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Preview Mode: Brackets per Division */}
      {showPreviewMode && seasonBrackets && seasonBrackets.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <Tabs defaultValue={seasonBrackets[0].divisions?.name || seasonBrackets[0].id}>
            <TabList>
              {seasonBrackets.map((bracket) => {
                const divName = bracket.divisions?.name || 'Division';
                return (
                  <Tab key={bracket.id} value={divName}>
                    {divisionLetterMap.get(bracket.id) || ''} - {divName}
                  </Tab>
                );
              })}
            </TabList>
            {seasonBrackets.map((bracket) => {
              const divName = bracket.divisions?.name || 'Division';
              const seedMap = teamSeedMaps.get(bracket.id);
              return (
                <TabPanel key={bracket.id} value={divName}>
                  <DivisionBracketTab
                    bracketId={bracket.id}
                    divisionName={divName}
                    onMatchClick={setSelectedMatch}
                    teamSeedMap={seedMap}
                  />
                </TabPanel>
              );
            })}
          </Tabs>

          {/* Master Schedule Table */}
          <MasterSchedule
            matches={allMatchesWithGameIds}
            timeSlots={scheduleConfig.timeSlots}
            onMatchClick={setSelectedMatch}
          />
        </div>
      )}

      {/* Match Scheduler Dialog */}
      <MatchScheduler
        match={selectedMatch}
        allMatches={allMatchesRaw || []}
        playAreas={scheduleConfig.playAreas}
        timeSlots={scheduleConfig.timeSlots}
        tournamentDate={scheduleConfig.tournamentDate}
        onSave={handleSaveMatch}
        onClose={() => setSelectedMatch(null)}
      />
    </div>
  );
}

/**
 * Tab content for a single division's bracket.
 */
function DivisionBracketTab({
  bracketId,
  divisionName,
  onMatchClick,
  teamSeedMap,
}: {
  bracketId: string;
  divisionName: string;
  onMatchClick: (match: BracketMatch) => void;
  teamSeedMap?: Map<string, number>;
}) {
  const { data: matches } = useBracketMatches(bracketId);
  const allMatches = matches || [];

  console.warn('[DivisionBracketTab]', divisionName, {
    bracketId,
    matchCount: allMatches.length,
    matches: allMatches.map((m) => ({
      id: m.id,
      round: m.round,
      pos: m.position,
      team1: m.team1?.name ?? m.team1_id ?? 'TBD',
      team2: m.team2?.name ?? m.team2_id ?? 'TBD',
      scheduled_at: m.scheduled_at,
      play_area: m.play_area,
      winner_next: m.winner_next_match_id,
    })),
  });

  return (
    <div className={adminStyles.section}>
      <h2 className={adminStyles.sectionTitle}>{divisionName} Bracket</h2>

      {allMatches.length > 0 && (
        <BracketTree
          matches={allMatches}
          onMatchClick={onMatchClick}
          editable
          teamSeedMap={teamSeedMap}
        />
      )}

      {allMatches.length === 0 && (
        <p style={{ color: 'var(--text-muted)' }}>No matches generated yet.</p>
      )}
    </div>
  );
}
