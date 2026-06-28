import postgres from 'postgres'

const sql = postgres({
  host: 'db.irzbyetxlfneqqfbjxzl.supabase.co',
  port: 5432,
  database: 'postgres',
  username: 'postgres',
  password: 'Shkodra.f12',
  ssl: 'require',
})

async function migrate() {
  console.log('Creating tables...')

  await sql`
    create table if not exists budget_months (
      id text primary key,
      user_id text not null,
      start_date text not null,
      end_date text,
      income numeric not null,
      weekly_budget numeric not null,
      is_active boolean default true,
      archived_at text
    )
  `
  await sql`
    create table if not exists expenses (
      id text primary key,
      user_id text not null,
      amount numeric not null,
      description text not null,
      category text not null,
      date text not null,
      notes text,
      budget_month_id text not null,
      type text not null,
      is_fixed boolean default false
    )
  `
  await sql`
    create table if not exists fixed_expenses (
      id text primary key,
      user_id text not null,
      name text not null,
      amount numeric not null,
      due_day integer not null,
      category text not null,
      is_paid boolean default false,
      paid_date text,
      budget_month_id text not null
    )
  `
  await sql`
    create table if not exists settings (
      user_id text primary key,
      salary numeric default 0,
      weekly_budget numeric default 0,
      currency text default 'EUR',
      currency_symbol text default '€',
      theme text default 'system',
      salary_day integer default 1,
      privacy_mode boolean default false,
      user_name text default '',
      notifications jsonb default '{}'
    )
  `
  await sql`
    create table if not exists savings_templates (
      id text primary key,
      user_id text not null,
      name text not null,
      icon text not null,
      amount numeric default 0,
      category text,
      description text
    )
  `
  await sql`
    create table if not exists shared_savings_goals (
      id text primary key,
      name text not null,
      icon text not null,
      target_amount numeric not null,
      description text,
      created_at text not null
    )
  `
  await sql`
    create table if not exists shared_contributions (
      id text primary key,
      goal_id text references shared_savings_goals(id) on delete cascade,
      user_id text not null,
      user_name text not null,
      amount numeric not null,
      description text not null,
      date text not null
    )
  `

  // Enable RLS and allow all (private app)
  for (const table of ['budget_months','expenses','fixed_expenses','settings','savings_templates','shared_savings_goals','shared_contributions']) {
    await sql.unsafe(`alter table ${table} enable row level security`)
    await sql.unsafe(`
      do $$ begin
        if not exists (select 1 from pg_policies where tablename='${table}' and policyname='public_access') then
          execute 'create policy public_access on ${table} for all using (true) with check (true)';
        end if;
      end $$
    `)
  }

  console.log('✅ All tables created successfully!')
  await sql.end()
}

migrate().catch(e => { console.error('❌ Error:', e.message); process.exit(1) })
