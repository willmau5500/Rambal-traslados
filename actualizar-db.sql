-- Ejecutar en Supabase SQL Editor

-- 1. Columna cantidad_por_caja en productos
ALTER TABLE productos ADD COLUMN IF NOT EXISTS cantidad_por_caja NUMERIC(12,2) DEFAULT 1;

-- 2. Columna lote en traslado_items (lote por producto en cada traslado)
ALTER TABLE traslado_items ADD COLUMN IF NOT EXISTS lote TEXT;

-- 3. Quitar columna lote de productos (ya no se usa ahí)
ALTER TABLE productos DROP COLUMN IF EXISTS lote;

-- Verificar
SELECT column_name FROM information_schema.columns 
WHERE table_name IN ('productos','traslado_items') 
ORDER BY table_name, column_name;
