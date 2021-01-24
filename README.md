# Deutsch
## Vorraussetzungen
- [NodeJS](https://nodejs.org/)
## Getting started
1. Die Repository clonen (`git clone https://github.com/TheCrazyMaffin/EventPlanner.git`) oder via GitHub herunterladen und die ZIP-Datei extrahieren.
2. Die Datei `.env.sample` in `.env` umbenennen, öffnen und ausfüllen.
3. Wenn gewünscht in `/public` ein eigenes Favicon platzieren und in `/lang` Seitentitel, usw abändern.
4. In dem Hauptordner (in dem Ordner, in dem `index.js` liegt) folgenden Befehl ausführen: `npm install`. Dies kann eine oder mehrere Minuten in Anspruch nehmen.
5. Ebenfalls in diesem Hauptordner `node .` ausführen. Die Shell, die zum ausführen dieses Befehls genutzt wurde muss während dem benutzen der Webseite geöffnet bleiben!
6. Die Webseite ist nun unter `localhost:PORT` erreichbar. `PORT` ist der in `.env` angegebene Port.
7. Um einen Benutzeraccount erstellen zu können navigiert man zu `http://localhost:PORT/dev/register/host`. Diese URL funktioniert **nur** auf dem selben PC auf dem auch der Server läuft. Auf dieser Seite wird eine URL angezeigt die zu eine Registrations-Seite weiterleitet.
8. In Schritt 7 hat man ein Benutzerkonto erstellt, das alle Rechte hat. Um eine Registrations-URL für normale Nutzer zu bekommen navigiert man zu `http://localhost:PORT/deb/register`. Schritte 7 und 8 können beliebig oft wiederholt werden.
9. Im Header kann man sich nun mit den entsprechenden Daten anmelden.

## Erklärung
- Die Events im `Home`-Tab sind anklickbar. (Beim ersten Mal werden keine Events vorhanden sein. Diese müssen erst als Host erstellt werden) Wenn man angemeldet ist kann man an diesen Events teilnehmen.
- Im `Dashboard`-Tab kann man als Nutzer, die Events sehen bei denen man sich eingeschrieben hat. Als Host können hier eigene Events verwaltet werden. Die Anwesenheit und Host-Notiz ist nur für Teilnehmer sichtbar.


## Hinweise
- Als Browser sind die Aktuellen Versionen von Chrome, Firefox und Safari unterstüzt. Auf anderen Browsern können Probleme auftreten
- Die Webseite funktioniert **nicht** ohne JavaScript.