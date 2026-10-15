export interface RecurrenceRule {
  type: 'days' | 'weeks' | 'months';
  interval: number;
}

export function calculateNextDueDate(ruleStr: string, fromDate: number = Date.now()): number | null {
  try {
    const date = new Date(fromDate);
    
    // Si ruleStr es JSON, parsearlo (comportamiento legacy)
    if (ruleStr.startsWith('{')) {
      const rule: RecurrenceRule = JSON.parse(ruleStr);
      switch (rule.type) {
        case 'days': date.setDate(date.getDate() + rule.interval); break;
        case 'weeks': date.setDate(date.getDate() + (rule.interval * 7)); break;
        case 'months': date.setMonth(date.getMonth() + rule.interval); break;
      }
      return date.getTime();
    }

    // Comportamiento nuevo:
    if (ruleStr === 'DAILY') {
      date.setDate(date.getDate() + 1);
    } else if (ruleStr === 'WEEKLY') {
      date.setDate(date.getDate() + 7);
    } else if (ruleStr === 'MONTHLY') {
      date.setMonth(date.getMonth() + 1);
    } else if (ruleStr === 'YEARLY') {
      date.setFullYear(date.getFullYear() + 1);
    } else if (ruleStr.startsWith('CUSTOM:')) {
      // CUSTOM:1,3,5 (lunes, miercoles, viernes)
      // Buscamos el próximo día de la semana que coincida
      const days = ruleStr.split(':')[1].split(',').map(Number);
      if (days.length === 0) return null;
      let found = false;
      for (let i = 1; i <= 7; i++) {
        date.setDate(date.getDate() + 1);
        // getDay(): 0=Dom, 1=Lun ... 6=Sab
        // En nuestro customDay (ej: "Lunes" = 1), mapear a getDay() o asegurarnos de coincidir.
        // Asumiendo que 1=Lun, 7=Dom o 0=Dom
        let currentDay = date.getDay();
        if (currentDay === 0) currentDay = 7; // Convertir domingo a 7
        if (days.includes(currentDay)) {
          found = true;
          break;
        }
      }
      if (!found) return null;
    } else {
      return null;
    }

    return date.getTime();
  } catch (error) {
    console.error("Invalid recurrence rule format:", error);
    return null;
  }
}

// Ejemplo de helper para extraer comandos naturales tipo "cada 90 dias"
export function parseNaturalRecurrence(text: string): RecurrenceRule | null {
  const match = text.toLowerCase().match(/cada\s+(\d+)\s+(d[ií]a|d[ií]as|semana|semanas|mes|meses)/);
  if (!match) return null;

  const interval = parseInt(match[1], 10);
  const typeStr = match[2];

  let type: 'days' | 'weeks' | 'months' = 'days';
  if (typeStr.startsWith('semana')) type = 'weeks';
  if (typeStr.startsWith('mes')) type = 'months';

  return { type, interval };
}

// Helper para extraer fechas exactas tipo "el 30 de oct", "mañana"
export function parseExactDate(text: string): number | null {
  const t = text.toLowerCase();
  const today = new Date();

  if (t.includes('mañana') || t.includes('manana')) {
    today.setDate(today.getDate() + 1);
    today.setHours(9, 0, 0, 0); // Default 9 AM
    return today.getTime();
  }

  // Regex para "el [dia] de [mes]"
  const match = t.match(/el\s+(\d+)\s+de\s+([a-z]+)/);
  if (match) {
    const day = parseInt(match[1], 10);
    const monthStr = match[2].substring(0, 3);
    
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const monthIndex = months.indexOf(monthStr);

    if (monthIndex !== -1) {
      let year = today.getFullYear();
      // Si el mes ya pasó este año, lo tiramos para el próximo
      if (monthIndex < today.getMonth() || (monthIndex === today.getMonth() && day < today.getDate())) {
        year += 1;
      }
      
      const targetDate = new Date(year, monthIndex, day, 9, 0, 0, 0);
      return targetDate.getTime();
    }
  }

  return null;
}
