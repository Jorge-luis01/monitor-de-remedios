interface PageHeaderProps {
  title: string;
  description: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="page-heading">
      <p className="eyebrow">Dose Certa</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}
