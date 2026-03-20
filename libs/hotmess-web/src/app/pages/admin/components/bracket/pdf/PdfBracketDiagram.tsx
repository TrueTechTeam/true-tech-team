import React from 'react';
import { View, Text, Svg, Line, Rect, G } from '@react-pdf/renderer';
import type { BracketMatch } from '../../../../../../hooks/useBracketMatches';
import { findTimeSlotIndex } from '../../../utils/rainbowColors';
import { PDF_COLORS, getSlotColor } from './pdfTheme';

// ─── Layout constants (in PDF points) ────────────────────────────────────────

const SLOT_HEIGHT = 20;        // vertical space for one team name above its line
const SLOT_GAP = 4;            // gap between two team lines in a match
const ROUND_GAP = 150;         // horizontal distance between round columns
const MATCH_SPACING = 12;      // extra vertical space between first-round matches
const TEAM_LINE_WIDTH = 120;   // horizontal length of each team slot line
const SEED_WIDTH = 14;         // space reserved for the seed number
const FONT_TEAM = 8;
const FONT_SEED = 7;
const FONT_BADGE = 6.5;
const FONT_FIELD = 5.5;
const LINE_WEIGHT = 1.2;
const BADGE_W = 48;
const BADGE_H = 12;

// ─── Types ───────────────────────────────────────────────────────────────────

interface MatchPos {
  x: number;
  topLineY: number;    // Y of the top team's horizontal line
  bottomLineY: number; // Y of the bottom team's horizontal line
  midY: number;        // junction point (midpoint between the two lines)
  rightX: number;      // right edge of team slot lines
  match: BracketMatch;
}

interface DiagramLayout {
  positions: MatchPos[];
  width: number;
  height: number;
}

// ─── Layout algorithm ────────────────────────────────────────────────────────

function groupByRound(matches: BracketMatch[]): Map<number, BracketMatch[]> {
  const grouped = new Map<number, BracketMatch[]>();
  for (const m of matches) {
    if (!grouped.has(m.round)) {
      grouped.set(m.round, []);
    }
    const arr = grouped.get(m.round);
    if (arr) { arr.push(m); }
  }
  for (const [, arr] of grouped) {
    arr.sort((a, b) => a.position - b.position);
  }
  return grouped;
}

function computeLayout(matches: BracketMatch[]): DiagramLayout {
  if (matches.length === 0) {
    return { positions: [], width: 0, height: 0 };
  }

  const grouped = groupByRound(matches);
  const rounds = Array.from(grouped.keys()).sort((a, b) => a - b);

  // Build parent map: childMatchId → feeder matches
  const parentMap = new Map<string, BracketMatch[]>();
  for (const m of matches) {
    if (m.winner_next_match_id) {
      if (!parentMap.has(m.winner_next_match_id)) {
        parentMap.set(m.winner_next_match_id, []);
      }
      const parents = parentMap.get(m.winner_next_match_id);
      if (parents) { parents.push(m); }
    }
  }

  const posMap = new Map<string, MatchPos>();
  const allPositions: MatchPos[] = [];

  // Height of one match block: topLine + gap + bottomLine
  const matchBlockHeight = SLOT_HEIGHT + SLOT_GAP + SLOT_HEIGHT;
  const firstRoundStep = matchBlockHeight + MATCH_SPACING;

  // First round: evenly spaced
  const firstRoundMatches = grouped.get(rounds[0]) || [];
  for (let i = 0; i < firstRoundMatches.length; i++) {
    const m = firstRoundMatches[i];
    const topLineY = i * firstRoundStep + SLOT_HEIGHT; // leave space for text above
    const bottomLineY = topLineY + SLOT_GAP + SLOT_HEIGHT;
    const pos: MatchPos = {
      x: 0,
      topLineY,
      bottomLineY,
      midY: (topLineY + bottomLineY) / 2,
      rightX: SEED_WIDTH + TEAM_LINE_WIDTH,
      match: m,
    };
    posMap.set(m.id, pos);
    allPositions.push(pos);
  }

  // Subsequent rounds: center between parent matches
  for (let ri = 1; ri < rounds.length; ri++) {
    const roundMatches = grouped.get(rounds[ri]) || [];
    const x = ri * ROUND_GAP;
    const rightX = x + SEED_WIDTH + TEAM_LINE_WIDTH;

    for (let i = 0; i < roundMatches.length; i++) {
      const m = roundMatches[i];
      const parents = parentMap.get(m.id) || [];

      let topLineY: number;
      let bottomLineY: number;

      if (parents.length === 2) {
        // Center between the two parent match junctions
        const p0 = posMap.get(parents[0].id);
        const p1 = posMap.get(parents[1].id);
        if (p0 && p1) {
          topLineY = p0.midY;
          bottomLineY = p1.midY;
        } else {
          const fallback = i * firstRoundStep * Math.pow(2, ri) + SLOT_HEIGHT;
          topLineY = fallback;
          bottomLineY = fallback + SLOT_GAP + SLOT_HEIGHT;
        }
      } else if (parents.length === 1) {
        // Bye case
        const parent = posMap.get(parents[0].id);
        if (parent) {
          const mid = parent.midY;
          topLineY = mid - (SLOT_GAP + SLOT_HEIGHT) / 2;
          bottomLineY = topLineY + SLOT_GAP + SLOT_HEIGHT;
        } else {
          const fallback = i * firstRoundStep * Math.pow(2, ri) + SLOT_HEIGHT;
          topLineY = fallback;
          bottomLineY = fallback + SLOT_GAP + SLOT_HEIGHT;
        }
      } else {
        const fallback = i * firstRoundStep * Math.pow(2, ri) + SLOT_HEIGHT;
        topLineY = fallback;
        bottomLineY = fallback + SLOT_GAP + SLOT_HEIGHT;
      }

      const pos: MatchPos = {
        x,
        topLineY,
        bottomLineY,
        midY: (topLineY + bottomLineY) / 2,
        rightX,
        match: m,
      };
      posMap.set(m.id, pos);
      allPositions.push(pos);
    }
  }

  // Total dimensions
  let maxX = 0;
  let maxY = 0;
  for (const pos of allPositions) {
    if (pos.rightX > maxX) { maxX = pos.rightX; }
    if (pos.bottomLineY + 14 > maxY) { maxY = pos.bottomLineY + 14; } // extra for field label below badge
  }
  // Extra space for championship line
  maxX += ROUND_GAP * 0.5;

  return { positions: allPositions, width: maxX, height: maxY };
}

// ─── Time formatting ─────────────────────────────────────────────────────────

function formatTime(scheduledAt: string | undefined): string {
  if (!scheduledAt) { return ''; }
  const d = new Date(scheduledAt);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m} ${ampm}`;
}

// ─── Component ───────────────────────────────────────────────────────────────

interface PdfBracketDiagramProps {
  matches: BracketMatch[];
  teamSeedMap?: Map<string, number>;
  timeSlots: string[];
  areaWidth: number;
  areaHeight: number;
}

export function PdfBracketDiagram({
  matches,
  teamSeedMap,
  timeSlots,
  areaWidth,
  areaHeight,
}: PdfBracketDiagramProps) {
  const layout = computeLayout(matches);

  if (layout.positions.length === 0) {
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <Text style={{ fontSize: 10, color: PDF_COLORS.textMuted }}>No matches</Text>
      </View>
    );
  }

  // Scale to fit available area
  const scaleX = areaWidth / layout.width;
  const scaleY = areaHeight / layout.height;
  const scale = Math.min(scaleX, scaleY, 1);

  const svgW = layout.width * scale;
  const svgH = layout.height * scale;
  const s = (v: number) => v * scale;

  // Build position lookup for connectors
  const posMap = new Map<string, MatchPos>();
  for (const p of layout.positions) {
    posMap.set(p.match.id, p);
  }

  return (
    <View style={{ width: svgW, height: svgH, alignSelf: 'center', position: 'relative' }}>
      {/* SVG layer: all lines, rectangles */}
      <Svg width={svgW} height={svgH} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Connector lines between rounds */}
        {layout.positions.map((pos) => {
          const m = pos.match;
          if (!m.winner_next_match_id) { return null; }
          const next = posMap.get(m.winner_next_match_id);
          if (!next) { return null; }

          const fromX = s(pos.rightX);
          const fromY = s(pos.midY);
          const midX = fromX + (s(next.x) - fromX) / 2;
          const toY = s(next.midY);
          const toX = s(next.x);

          return (
            <G key={`c-${m.id}`}>
              <Line x1={fromX} y1={fromY} x2={midX} y2={fromY}
                stroke={PDF_COLORS.line} strokeWidth={s(LINE_WEIGHT)} />
              <Line x1={midX} y1={fromY} x2={midX} y2={toY}
                stroke={PDF_COLORS.line} strokeWidth={s(LINE_WEIGHT)} />
              <Line x1={midX} y1={toY} x2={toX} y2={toY}
                stroke={PDF_COLORS.line} strokeWidth={s(LINE_WEIGHT)} />
            </G>
          );
        })}

        {/* Match bracket shapes: two horizontal lines + right vertical closing */}
        {layout.positions.map((pos) => (
          <G key={`m-${pos.match.id}`}>
            {/* Top team line */}
            <Line x1={s(pos.x + SEED_WIDTH)} y1={s(pos.topLineY)} x2={s(pos.rightX)} y2={s(pos.topLineY)}
              stroke={PDF_COLORS.line} strokeWidth={s(LINE_WEIGHT)} />
            {/* Bottom team line */}
            <Line x1={s(pos.x + SEED_WIDTH)} y1={s(pos.bottomLineY)} x2={s(pos.rightX)} y2={s(pos.bottomLineY)}
              stroke={PDF_COLORS.line} strokeWidth={s(LINE_WEIGHT)} />
            {/* Right vertical bracket closure */}
            <Line x1={s(pos.rightX)} y1={s(pos.topLineY)} x2={s(pos.rightX)} y2={s(pos.bottomLineY)}
              stroke={PDF_COLORS.line} strokeWidth={s(LINE_WEIGHT)} />
          </G>
        ))}

        {/* Time badges (colored rectangles) */}
        {layout.positions.map((pos) => {
          const m = pos.match;
          if (!m.scheduled_at) { return null; }

          const slotIdx = findTimeSlotIndex(m.scheduled_at, timeSlots);
          const badgeColor = getSlotColor(slotIdx);
          const bw = s(BADGE_W);
          const bh = s(BADGE_H);
          const bx = s(pos.rightX) + 4 * scale;
          const by = s(pos.midY) - bh / 2;

          return (
            <Rect key={`b-${m.id}`}
              x={bx} y={by} width={bw} height={bh}
              rx={s(3)} fill={badgeColor}
            />
          );
        })}

        {/* Championship result line */}
        {(() => {
          const finalMatch = layout.positions.find((p) => !p.match.winner_next_match_id);
          if (!finalMatch) { return null; }
          const x1 = s(finalMatch.rightX);
          const x2 = x1 + s(ROUND_GAP * 0.35);
          const y = s(finalMatch.midY);
          return (
            <Line x1={x1} y1={y} x2={x2} y2={y}
              stroke={PDF_COLORS.line} strokeWidth={s(LINE_WEIGHT)} />
          );
        })()}
      </Svg>

      {/* Text layer: team names, seeds, badge text, field labels */}
      {layout.positions.map((pos) => {
        const m = pos.match;
        const team1Name = m.team1?.name || '';
        const team2Name = m.team2?.name || '';
        const seed1 = m.team1_id ? teamSeedMap?.get(m.team1_id) : undefined;
        const seed2 = m.team2_id ? teamSeedMap?.get(m.team2_id) : undefined;

        const fontSize = Math.max(s(FONT_TEAM), 6);
        const seedFontSize = Math.max(s(FONT_SEED), 5);
        const textAboveLineOffset = 3 * scale; // text sits above the horizontal line

        return (
          <React.Fragment key={`t-${m.id}`}>
            {/* Team 1: seed + name above top line */}
            <View style={{
              position: 'absolute',
              left: s(pos.x),
              top: s(pos.topLineY) - fontSize - textAboveLineOffset,
              flexDirection: 'row',
              alignItems: 'flex-end',
              width: s(SEED_WIDTH + TEAM_LINE_WIDTH),
            }}>
              {seed1 !== undefined && (
                <Text style={{
                  fontSize: seedFontSize,
                  fontFamily: 'Helvetica-Bold',
                  color: PDF_COLORS.text,
                  width: s(SEED_WIDTH),
                }}>
                  {String(seed1)}
                </Text>
              )}
              <Text style={{
                fontSize,
                fontFamily: 'Helvetica',
                color: team1Name ? PDF_COLORS.text : PDF_COLORS.textMuted,
              }}>
                {team1Name || ''}
              </Text>
            </View>

            {/* Team 2: seed + name above bottom line */}
            <View style={{
              position: 'absolute',
              left: s(pos.x),
              top: s(pos.bottomLineY) - fontSize - textAboveLineOffset,
              flexDirection: 'row',
              alignItems: 'flex-end',
              width: s(SEED_WIDTH + TEAM_LINE_WIDTH),
            }}>
              {seed2 !== undefined && (
                <Text style={{
                  fontSize: seedFontSize,
                  fontFamily: 'Helvetica-Bold',
                  color: PDF_COLORS.text,
                  width: s(SEED_WIDTH),
                }}>
                  {String(seed2)}
                </Text>
              )}
              <Text style={{
                fontSize,
                fontFamily: 'Helvetica',
                color: team2Name ? PDF_COLORS.text : PDF_COLORS.textMuted,
              }}>
                {team2Name || ''}
              </Text>
            </View>

            {/* Time badge text (white on colored bg) */}
            {m.scheduled_at && (
              <View style={{
                position: 'absolute',
                left: s(pos.rightX) + 4 * scale,
                top: s(pos.midY) - s(BADGE_H) / 2,
                width: s(BADGE_W),
                height: s(BADGE_H),
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Text style={{
                  fontSize: Math.max(s(FONT_BADGE), 5),
                  fontFamily: 'Helvetica-Bold',
                  color: '#ffffff',
                }}>
                  {formatTime(m.scheduled_at)}
                </Text>
              </View>
            )}

            {/* Field label below time badge */}
            {m.play_area && m.scheduled_at && (
              <Text style={{
                position: 'absolute',
                left: s(pos.rightX) + 4 * scale,
                top: s(pos.midY) + s(BADGE_H) / 2 + 1 * scale,
                fontSize: Math.max(s(FONT_FIELD), 4.5),
                fontFamily: 'Helvetica',
                color: PDF_COLORS.textSecondary,
                width: s(BADGE_W),
                textAlign: 'center',
              }}>
                {m.play_area}
              </Text>
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}
