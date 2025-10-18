-- Create table to track monthly per-user usage for resume features
create table if not exists public.resume_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  action text not null check (action in ('generation','analysis')),
  year int not null,
  month int not null check (month between 1 and 12),
  count int not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Ensure one row per user/action/month
create unique index if not exists resume_usage_unique_idx
  on public.resume_usage (user_id, action, year, month);

-- Simple trigger to auto update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_resume_usage_updated_at on public.resume_usage;
create trigger set_resume_usage_updated_at
before update on public.resume_usage
for each row execute function public.set_updated_at();

-- Grant access (adjust as needed)
grant select, insert, update on public.resume_usage to authenticated;
