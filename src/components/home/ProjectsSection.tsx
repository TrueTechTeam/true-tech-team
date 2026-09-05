import { createClient } from '../../lib/supabase/server';
import { getUserPermissions } from '../../lib/auth/permissions';
import { projects } from '../../lib/data/projects';
import ProjectCard from './ProjectCard';
import styles from './ProjectsSection.module.scss';

export default async function ProjectsSection() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const permissions = user ? await getUserPermissions(user.id) : { isAdmin: false, appAccess: [] };

  return (
    <section id="projects" className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>Our Projects</h2>
        <p className={styles.subtitle}>
          Explore our portfolio of innovative solutions and modern web applications
        </p>
        <div className={styles.grid}>
          {projects.map((project) => {
            const hasAccess = project.appSlug
              ? permissions.isAdmin || permissions.appAccess.includes(project.appSlug)
              : true;

            return (
              <ProjectCard
                key={project.id}
                title={project.title}
                description={project.description}
                image={project.image}
                tags={project.tags}
                demoUrl={hasAccess ? project.demoUrl : undefined}
                githubUrl={project.githubUrl}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
