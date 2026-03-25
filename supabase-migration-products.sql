-- ============================================
-- OptiHub — Migration: Product Modules (IA Ótica + IA Agendamento)
-- Cole no Supabase Dashboard → SQL Editor → Run
-- ============================================

-- 1. Product Subscriptions
CREATE TABLE IF NOT EXISTS public.product_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product text NOT NULL CHECK (product IN ('IA_OTICA', 'IA_AGENDAMENTO')),
  asaas_customer_id text NOT NULL,
  asaas_subscription_id text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'ACTIVE', 'OVERDUE', 'CANCELLED', 'EXPIRED')),
  overdue_since timestamptz,
  billing_type text NOT NULL CHECK (billing_type IN ('PIX', 'BOLETO', 'CREDIT_CARD')),
  value numeric(10,2) NOT NULL,
  next_due_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  cancelled_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_product_subs_user ON public.product_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_product_subs_product ON public.product_subscriptions(product);
CREATE INDEX IF NOT EXISTS idx_product_subs_asaas ON public.product_subscriptions(asaas_subscription_id);

ALTER TABLE public.product_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own product subscriptions"
  ON public.product_subscriptions FOR SELECT USING (auth.uid() = user_id);

-- 2. Product Payments
CREATE TABLE IF NOT EXISTS public.product_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_subscription_id uuid REFERENCES public.product_subscriptions(id) ON DELETE SET NULL,
  asaas_payment_id text NOT NULL UNIQUE,
  status text NOT NULL
    CHECK (status IN ('PENDING', 'CONFIRMED', 'RECEIVED', 'OVERDUE', 'REFUNDED', 'DELETED', 'FAILED')),
  billing_type text NOT NULL CHECK (billing_type IN ('PIX', 'BOLETO', 'CREDIT_CARD')),
  value numeric(10,2) NOT NULL,
  net_value numeric(10,2),
  due_date date NOT NULL,
  payment_date date,
  invoice_url text,
  pix_qr_code text,
  pix_copy_paste text,
  boleto_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_payments_user ON public.product_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_product_payments_asaas ON public.product_payments(asaas_payment_id);

ALTER TABLE public.product_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own product payments"
  ON public.product_payments FOR SELECT USING (auth.uid() = user_id);

-- 3. IA Ótica Events (analytics)
CREATE TABLE IF NOT EXISTS public.ia_otica_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('ATTENDANCE', 'HANDOFF', 'QUOTE')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ia_otica_events_user ON public.ia_otica_events(user_id);
CREATE INDEX IF NOT EXISTS idx_ia_otica_events_type ON public.ia_otica_events(event_type);
CREATE INDEX IF NOT EXISTS idx_ia_otica_events_created ON public.ia_otica_events(created_at DESC);

ALTER TABLE public.ia_otica_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own ia_otica events"
  ON public.ia_otica_events FOR SELECT USING (auth.uid() = user_id);

-- 4. Follow-up Sequences
CREATE TABLE IF NOT EXISTS public.followup_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'CUSTOM'
    CHECK (category IN ('FOLLOW_UP', 'POST_SALE', 'REENGAGEMENT', 'CUSTOM')),
  is_active boolean NOT NULL DEFAULT false,
  is_template boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_followup_sequences_user ON public.followup_sequences(user_id);

ALTER TABLE public.followup_sequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own followup sequences"
  ON public.followup_sequences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own followup sequences"
  ON public.followup_sequences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own followup sequences"
  ON public.followup_sequences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own followup sequences"
  ON public.followup_sequences FOR DELETE USING (auth.uid() = user_id);

-- 5. Follow-up Steps
CREATE TABLE IF NOT EXISTS public.followup_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id uuid REFERENCES public.followup_sequences(id) ON DELETE CASCADE NOT NULL,
  step_order int NOT NULL,
  delay_minutes int NOT NULL DEFAULT 0,
  allowed_hours_start int NOT NULL DEFAULT 8 CHECK (allowed_hours_start BETWEEN 0 AND 23),
  allowed_hours_end int NOT NULL DEFAULT 20 CHECK (allowed_hours_end BETWEEN 0 AND 23),
  allowed_days int[] NOT NULL DEFAULT '{1,2,3,4,5}',
  message_type text NOT NULL DEFAULT 'TEXT' CHECK (message_type IN ('TEXT', 'PHOTO', 'VIDEO')),
  message_content text NOT NULL,
  media_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_followup_steps_sequence ON public.followup_steps(sequence_id, step_order);

ALTER TABLE public.followup_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own followup steps" ON public.followup_steps FOR ALL
  USING (EXISTS (SELECT 1 FROM public.followup_sequences s WHERE s.id = sequence_id AND s.user_id = auth.uid()));

-- 6. Scheduling Availability
CREATE TABLE IF NOT EXISTS public.scheduling_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  day_of_week int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  is_available boolean NOT NULL DEFAULT true,
  start_time time NOT NULL DEFAULT '08:00',
  end_time time NOT NULL DEFAULT '18:00',
  slot_duration_minutes int NOT NULL DEFAULT 30,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, day_of_week)
);

ALTER TABLE public.scheduling_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own availability"
  ON public.scheduling_availability FOR ALL USING (auth.uid() = user_id);

-- 7. Scheduling Blocked Dates
CREATE TABLE IF NOT EXISTS public.scheduling_blocked_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  blocked_date date NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, blocked_date)
);

ALTER TABLE public.scheduling_blocked_dates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own blocked dates"
  ON public.scheduling_blocked_dates FOR ALL USING (auth.uid() = user_id);

-- 8. Scheduling Appointments
CREATE TABLE IF NOT EXISTS public.scheduling_appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  customer_name text NOT NULL,
  customer_phone text,
  customer_email text,
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  duration_minutes int NOT NULL DEFAULT 30,
  status text NOT NULL DEFAULT 'SCHEDULED'
    CHECK (status IN ('SCHEDULED', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW')),
  notes text,
  source text NOT NULL DEFAULT 'AI' CHECK (source IN ('AI', 'MANUAL')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_user ON public.scheduling_appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.scheduling_appointments(appointment_date);

ALTER TABLE public.scheduling_appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own appointments"
  ON public.scheduling_appointments FOR ALL USING (auth.uid() = user_id);

SELECT 'Migration completed successfully!' AS result;
