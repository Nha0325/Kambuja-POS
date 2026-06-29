const d = new Date('2026-06-29T14:30:00.000Z');
console.log("Original:", d.toISOString());
d.setHours(0,0,0,0);
console.log("Start:", d.toISOString());
d.setHours(23,59,59,999);
console.log("End:", d.toISOString());
