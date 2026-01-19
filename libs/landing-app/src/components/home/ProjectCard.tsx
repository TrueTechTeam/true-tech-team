'use client';

import { Badge, Button } from '@true-tech-team/ui-components';
import styles from './ProjectCard.module.scss';

interface ProjectCardProps {
  title: string;
  description: string;
  image: string;
  tags: string[];
  demoUrl?: string;
  githubUrl?: string;
}

export default function ProjectCard({
  title,
  description,
  image,
  tags,
  demoUrl,
  githubUrl,
}: ProjectCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.imageWrapper}>
        <div className={styles.placeholder}>
          <span>{title}</span>
        </div>
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
        <div className={styles.tags}>
          {tags.map((tag) => (
            <Badge key={tag} variant="neutral">
              {tag}
            </Badge>
          ))}
        </div>
        <div className={styles.actions}>
          {demoUrl && (
            <a href={demoUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="primary" size="sm">
                View Demo
              </Button>
            </a>
          )}
          {githubUrl && (
            <a href={githubUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                GitHub
              </Button>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
