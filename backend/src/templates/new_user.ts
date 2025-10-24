import fs from 'fs';
import path from 'path';

export function new_user_html(
    name: string,
    text: string,
) {
    const tplPath = path.join(__dirname, './files/new_user.html');
    let html = fs.readFileSync(tplPath, 'utf-8');
    const safeName = name && name.trim() ? name : 'Usuario';
    html = html.replace(/\{\{name\}\}/g, safeName);
    html = html.replace(/\{\{text_message\}\}/g, text);
    return html;
}
