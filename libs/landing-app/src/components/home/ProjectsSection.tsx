'use client';

import { projects } from '../../lib/data/projects';
import ProjectCard from './ProjectCard';
import styles from './ProjectsSection.module.scss';

export default function ProjectsSection() {
  return (
    <section id="projects" className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>Our Projects</h2>
        <p className={styles.subtitle}>
          Explore our portfolio of innovative solutions and modern web applications
        </p>
        <div className={styles.grid}>
          {projects.map((project) => (
            <ProjectCard key={project.id} {...project} />
          ))}
        </div>
      </div>
    </section>
  );
}

