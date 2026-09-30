create extension if not exists vector with schema extensions;

create table if not exists public.documents (
  id bigserial primary key,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  embedding extensions.vector(3072)
);

create or replace function public.match_documents (
  query_embedding extensions.vector(3072),
  match_count integer default 6,
  filter jsonb default '{}'::jsonb
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity double precision
)
language sql
stable
as $$
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from public.documents
  where documents.metadata @> filter
  order by documents.embedding <=> query_embedding
  limit match_count;
$$;

grant usage on schema public to service_role;
grant select, insert, update, delete on public.documents to service_role;
grant usage, select on sequence public.documents_id_seq to service_role;
grant execute on function public.match_documents(extensions.vector, integer, jsonb) to service_role;
