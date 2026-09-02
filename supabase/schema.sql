-- Bestiário Cultural · Supabase/PostgreSQL
-- Execute este arquivo inteiro no SQL Editor do seu projeto Supabase.

create table if not exists public.cultural_chapters (
  id bigint generated always as identity primary key,
  chapter_number integer not null unique,
  slug varchar(96) not null unique,
  title varchar(160) not null,
  subtitle varchar(220) not null default '',
  category varchar(20) not null check (category in ('musica','danca','artesanato','festa')),
  territory text not null default '',
  territorial_note text not null default '',
  excerpt text not null default '',
  content text not null default '',
  illustration_label varchar(200) not null default '',
  photo_url text not null default '',
  photo_credit varchar(300) not null default '',
  photo_source_url text not null default '',
  photo_license varchar(200) not null default '',
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cultural_sources (
  id bigint generated always as identity primary key,
  chapter_slug varchar(96) not null references public.cultural_chapters(slug) on update cascade on delete cascade,
  title text not null,
  institution varchar(200) not null,
  source_url text not null,
  note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.cultural_extra_pages (
  id bigint generated always as identity primary key,
  chapter_slug varchar(96) not null references public.cultural_chapters(slug) on update cascade on delete cascade,
  sort_order integer not null,
  eyebrow varchar(120) not null default 'Aprofundamento',
  title varchar(220) not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(chapter_slug, sort_order)
);

create table if not exists public.cultural_extra_page_images (
  id bigint generated always as identity primary key,
  page_id bigint not null references public.cultural_extra_pages(id) on delete cascade,
  sort_order integer not null,
  image_url text not null,
  alt_text varchar(500) not null default '',
  credit varchar(300) not null,
  source_url text not null,
  license varchar(200) not null,
  created_at timestamptz not null default now(),
  unique(page_id, sort_order)
);

create index if not exists cultural_chapters_published_idx on public.cultural_chapters(is_published, chapter_number);
create index if not exists cultural_sources_chapter_idx on public.cultural_sources(chapter_slug);
create index if not exists cultural_pages_chapter_idx on public.cultural_extra_pages(chapter_slug, sort_order);
create index if not exists cultural_images_page_idx on public.cultural_extra_page_images(page_id, sort_order);

alter table public.cultural_chapters enable row level security;
alter table public.cultural_sources enable row level security;
alter table public.cultural_extra_pages enable row level security;
alter table public.cultural_extra_page_images enable row level security;

grant all on table public.cultural_chapters, public.cultural_sources, public.cultural_extra_pages, public.cultural_extra_page_images to service_role;

insert into storage.buckets (id, name, public)
values ('cultural-images', 'cultural-images', true)
on conflict (id) do update set public = true;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cultural_chapters_updated_at on public.cultural_chapters;
create trigger cultural_chapters_updated_at before update on public.cultural_chapters for each row execute function public.set_updated_at();
drop trigger if exists cultural_pages_updated_at on public.cultural_extra_pages;
create trigger cultural_pages_updated_at before update on public.cultural_extra_pages for each row execute function public.set_updated_at();

drop policy if exists "public can read published chapters" on public.cultural_chapters;
create policy "public can read published chapters"
on public.cultural_chapters for select to anon, authenticated
using (is_published = true);

drop policy if exists "public can read sources" on public.cultural_sources;
create policy "public can read sources"
on public.cultural_sources for select to anon, authenticated
using (exists (select 1 from public.cultural_chapters c where c.slug = chapter_slug and c.is_published = true));

drop policy if exists "public can read published pages" on public.cultural_extra_pages;
create policy "public can read published pages"
on public.cultural_extra_pages for select to anon, authenticated
using (exists (select 1 from public.cultural_chapters c where c.slug = chapter_slug and c.is_published = true));

drop policy if exists "public can read published page images" on public.cultural_extra_page_images;
create policy "public can read published page images"
on public.cultural_extra_page_images for select to anon, authenticated
using (exists (
  select 1 from public.cultural_extra_pages p
  join public.cultural_chapters c on c.slug = p.chapter_slug
  where p.id = page_id and c.is_published = true
));
