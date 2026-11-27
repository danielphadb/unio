import { LogoView } from "./LogoView";

function ProjectPreview({ project }: any) {
  const i = project.selected ?? project.editing?.concept ?? project.favorites[0] ?? null;
  return i ? (
    <div className="preview" style={{ background: i.palette.paper }}>
      <LogoView
        concept={i}
        input={project.input}
        tagline={project.showTaglineInLogo}
        fallbackText
      />
    </div>
  ) : (
    <div className="preview" style={{ background: "var(--paper-3)" }} aria-hidden="true">
      <span className="fallback-name" style={{ color: "var(--ink)", padding: 16 }}>
        {project.input.name}
      </span>
    </div>
  );
}

export default ProjectPreview;
