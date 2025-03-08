
-- Enable RLS on tables that don't have it yet
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

-- Create users can only select their own data policies
CREATE POLICY "Users can view their own customers" ON public.customers FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can view their own products" ON public.products FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can view their own suppliers" ON public.suppliers FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can view their own tasks" ON public.tasks FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can view their own sales" ON public.sales FOR SELECT USING (auth.uid() = owner_id);

-- For sale_items, we need to join with sales to check ownership
CREATE POLICY "Users can view their own sale items" ON public.sale_items 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.sales 
    WHERE sales.id = sale_items.sale_id AND sales.owner_id = auth.uid()
  )
);

-- Create policies for insert operations
CREATE POLICY "Users can insert their own customers" ON public.customers FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can insert their own products" ON public.products FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can insert their own suppliers" ON public.suppliers FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can insert their own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can insert their own sales" ON public.sales FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- For sale_items, we need to join with sales to check ownership
CREATE POLICY "Users can insert their own sale items" ON public.sale_items 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sales 
    WHERE sales.id = sale_items.sale_id AND sales.owner_id = auth.uid()
  )
);

-- Create policies for update operations
CREATE POLICY "Users can update their own customers" ON public.customers FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can update their own products" ON public.products FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can update their own suppliers" ON public.suppliers FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can update their own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can update their own sales" ON public.sales FOR UPDATE USING (auth.uid() = owner_id);

-- For sale_items, we need to join with sales to check ownership
CREATE POLICY "Users can update their own sale items" ON public.sale_items 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.sales 
    WHERE sales.id = sale_items.sale_id AND sales.owner_id = auth.uid()
  )
);

-- Create policies for delete operations
CREATE POLICY "Users can delete their own customers" ON public.customers FOR DELETE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete their own products" ON public.products FOR DELETE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete their own suppliers" ON public.suppliers FOR DELETE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete their own tasks" ON public.tasks FOR DELETE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete their own sales" ON public.sales FOR DELETE USING (auth.uid() = owner_id);

-- For sale_items, we need to join with sales to check ownership
CREATE POLICY "Users can delete their own sale items" ON public.sale_items 
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.sales 
    WHERE sales.id = sale_items.sale_id AND sales.owner_id = auth.uid()
  )
);
