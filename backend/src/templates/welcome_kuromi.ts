import fs from 'fs';
import path from 'path';

export function welcomeKuromiHTML(name: string) {
  const tplPath = path.join(__dirname, './files/welcome_kuromi.html');
  let html = fs.readFileSync(tplPath, 'utf-8');
  const safeName = name && name.trim() ? name : 'Usuario';
  html = html.replace(/\{\{name\}\}/g, safeName);
  html = html.replace(/\{\{year\}\}/g, String(new Date().getFullYear()));
  return html;
}