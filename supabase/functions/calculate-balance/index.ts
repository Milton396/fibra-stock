import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const { serie_original } = await req.json()
  
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )
  
  const { data: movs } = await supabase
    .from("movimientos")
    .select("*")
    .eq("serie_original", serie_original)
  
  // Calcular ingresos y egresos
  const ingresos = movs?.filter(m => 
    ["INGRESO_INICIAL", "DEVOLUCION"].includes(m.tipo_movimiento)
  ).reduce((a, m) => a + m.metraje, 0) || 0
  
  const egresos = movs?.filter(m => 
    ["DESPACHO", "PRESTAMO"].includes(m.tipo_movimiento)
  ).reduce((a, m) => a + m.metraje, 0) || 0
  
  const saldo = ingresos - egresos
  
  return new Response(JSON.stringify({ saldo, ingresos, egresos }), {
    headers: { "Content-Type": "application/json" }
  })
})