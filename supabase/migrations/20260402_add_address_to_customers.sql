
-- Add address column to the customers table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'customers' 
                AND column_name = 'address') THEN
    ALTER TABLE public.customers ADD COLUMN address TEXT;
  END IF;
END $$;
