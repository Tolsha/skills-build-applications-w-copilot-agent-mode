import { useEffect, useState, type ReactNode } from 'react';

type LoadState<T> = { status: 'loading' } | { status: 'error' } | { status: 'ready'; data: T };

export function useLoad<T>(load: () => Promise<T>): LoadState<T> {
  const [state, setState] = useState<LoadState<T>>({ status: 'loading' });
  useEffect(() => {
    let active = true;
    load().then(
      (data) => active && setState({ status: 'ready', data }),
      () => active && setState({ status: 'error' }),
    );
    return () => { active = false; };
    // The loader is a fixed request per component, so it only runs on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return state;
}

type Props = {
  title: string;
  description: string;
  noun: string;
  state: LoadState<unknown[]>;
  emptyText: string;
  children: ReactNode;
};

export function CapabilityCard({ title, description, noun, state, emptyText, children }: Props) {
  let body: ReactNode = children;
  if (state.status === 'loading') body = <p role="status">Loading {noun}…</p>;
  else if (state.status === 'error') body = <p role="alert" className="text-danger">Unable to load {noun}. Please try again.</p>;
  else if (state.data.length === 0) body = <p>{emptyText}</p>;
  return <section className="card h-100"><div className="card-body"><h2 className="h4">{title}</h2><p>{description}</p>{body}</div></section>;
}
