-- ============================================
-- ÓptiHub — Schema SQL para Supabase
-- Cole este SQL no SQL Editor do Supabase
-- ============================================

-- 1. Tabela de perfis (estende o auth.users do Supabase)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  email text not null,
  image text,
  optica_name text,
  optica_logo text,
  optica_address text,
  optica_brands text[] default '{}',
  plan text not null default 'STARTER' check (plan in ('STARTER', 'PRO', 'REDE')),
  credits int not null default 30,
  custom_api_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Tabela de gerações
create table public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  tool text not null check (tool in ('CRIADOR', 'TRYON', 'EDITOR', 'ASSISTENTE')),
  prompt text not null,
  image_url text not null,
  input_urls text[] default '{}',
  metadata jsonb,
  shared boolean not null default false,
  created_at timestamptz not null default now()
);

-- 3. Posts da comunidade
create table public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  generation_id uuid references public.generations(id) on delete cascade not null unique,
  description text,
  likes_count int not null default 0,
  created_at timestamptz not null default now()
);

-- 4. Likes
create table public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.community_posts(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  unique(user_id, post_id)
);

-- 5. Templates
create table public.templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  prompt text not null,
  tool text not null check (tool in ('CRIADOR', 'TRYON', 'EDITOR', 'ASSISTENTE')),
  category text not null,
  usage_count int not null default 0,
  created_at timestamptz not null default now()
);

-- 6. Mensagens do chat (assistente)
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

-- ============================================
-- Indexes
-- ============================================
create index idx_generations_user on public.generations(user_id);
create index idx_generations_created on public.generations(created_at desc);
create index idx_community_posts_created on public.community_posts(created_at desc);
create index idx_community_posts_likes on public.community_posts(likes_count desc);
create index idx_likes_post on public.likes(post_id);
create index idx_templates_category on public.templates(category);
create index idx_chat_messages_user on public.chat_messages(user_id);

-- ============================================
-- RLS (Row Level Security)
-- ============================================

-- Profiles
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Generations
alter table public.generations enable row level security;

create policy "Users can view own generations"
  on public.generations for select
  using (auth.uid() = user_id);

create policy "Users can insert own generations"
  on public.generations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own generations"
  on public.generations for update
  using (auth.uid() = user_id);

-- Community Posts (visíveis para todos autenticados)
alter table public.community_posts enable row level security;

create policy "Anyone can view community posts"
  on public.community_posts for select
  using (auth.role() = 'authenticated');

create policy "Users can insert own posts"
  on public.community_posts for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own posts"
  on public.community_posts for delete
  using (auth.uid() = user_id);

-- Likes
alter table public.likes enable row level security;

create policy "Anyone can view likes"
  on public.likes for select
  using (auth.role() = 'authenticated');

create policy "Users can insert own likes"
  on public.likes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own likes"
  on public.likes for delete
  using (auth.uid() = user_id);

-- Templates (visíveis para todos)
alter table public.templates enable row level security;

create policy "Anyone can view templates"
  on public.templates for select
  using (auth.role() = 'authenticated');

create policy "Users can insert own templates"
  on public.templates for insert
  with check (auth.uid() = user_id);

-- Chat Messages
alter table public.chat_messages enable row level security;

create policy "Users can view own messages"
  on public.chat_messages for select
  using (auth.uid() = user_id);

create policy "Users can insert own messages"
  on public.chat_messages for insert
  with check (auth.uid() = user_id);

-- ============================================
-- Function: criar perfil automaticamente ao signup
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, image)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'avatar_url', null)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- Function: atualizar likes_count
-- ============================================
create or replace function public.update_likes_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.community_posts
    set likes_count = likes_count + 1
    where id = new.post_id;
  elsif TG_OP = 'DELETE' then
    update public.community_posts
    set likes_count = likes_count - 1
    where id = old.post_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger on_like_change
  after insert or delete on public.likes
  for each row execute function public.update_likes_count();

-- ============================================
-- Function: contar gerações do mês
-- ============================================
create or replace function public.get_monthly_usage(p_user_id uuid)
returns int as $$
  select count(*)::int
  from public.generations
  where user_id = p_user_id
    and created_at >= date_trunc('month', now());
$$ language sql security definer;

-- ============================================
-- Storage bucket para imagens
-- ============================================
insert into storage.buckets (id, name, public) values ('generations', 'generations', true);

create policy "Authenticated users can upload images"
  on storage.objects for insert
  with check (bucket_id = 'generations' and auth.role() = 'authenticated');

create policy "Anyone can view generation images"
  on storage.objects for select
  using (bucket_id = 'generations');
