type Props = {
  title: string;
  lead?: string;
};

export function PageHero({ title, lead }: Props) {
  return (
    <div className="page-hero">
      <div className="container">
        <h1 className="reveal">{title}</h1>
        {lead ? <p className="reveal reveal-delay">{lead}</p> : null}
      </div>
    </div>
  );
}
