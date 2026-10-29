# Responsible use & disclaimer

RepoGuard is a **defensive** security tool. It only reports and explains weaknesses — it
never generates or runs exploit code, payloads or attacks.

## Authorized use only — your own systems

You may use RepoGuard **only** on:

- source code, repositories and files that you own or are explicitly authorized to analyze; and
- live websites and servers that **you own**, or for which you have **written permission** from
  the owner to test.

The live-website audit is intentionally gated behind an **ownership check** (a verification file
you upload, or a DNS TXT record you set) and is **passive** — it reads publicly available
responses, it does not fuzz, brute-force, log in, or send payloads. Even so, scanning,
probing or testing a system you do not own or are not authorized to test may be **illegal**
in your jurisdiction and may violate the target's terms of service. You are solely responsible
for making sure you have permission **before** you scan anything.

Do **not** use RepoGuard against third-party sites, shared hosting you don't control, or any
system without authorization.

## No warranty

This software is provided **"as is", without warranty of any kind**, express or implied,
including but not limited to the warranties of merchantability, fitness for a particular
purpose and non-infringement (see the [MIT `LICENSE`](LICENSE)).

RepoGuard helps you find common problems, but it is **not a guarantee of security**. It can
miss real issues (false negatives) and report things that are not exploitable in your context
(false positives). It is one input to your own review — not a substitute for it.

## No liability

To the maximum extent permitted by law, the authors and contributors are **not liable** for any
claim, damages or other liability — including any downtime, data loss, service disruption,
cost, or legal consequence — arising from the use of this software or from any scan you run with
it. **You run RepoGuard at your own risk and on your own responsibility.**

## In short

- ✅ Your own repositories and your own servers.
- ✅ Systems you have written permission to test.
- ❌ Anyone else's systems, without authorization.
- ⚠️ Provided as is, no warranty, no liability. You are responsible for how you use it.

---

# Odpovědné použití a vyloučení odpovědnosti (Česky)

RepoGuard je **obranný** bezpečnostní nástroj. Pouze hlásí a vysvětluje slabiny — nikdy
negeneruje ani nespouští útočný kód, payloady ani útoky.

## Jen se svolením — pouze vlastní systémy

RepoGuard smíte používat **výhradně** na:

- zdrojový kód, repozitáře a soubory, které vlastníte nebo máte výslovné oprávnění analyzovat; a
- živé weby a servery, které **vlastníte**, nebo ke kterým máte **písemný souhlas** majitele
  s testováním.

Audit živého webu je záměrně podmíněn **ověřením vlastnictví** (nahraný ověřovací soubor nebo
DNS TXT záznam) a je **pasivní** — čte jen veřejně dostupné odpovědi, neprovádí fuzzing,
nehádá hesla, nepřihlašuje se a neposílá payloady. I tak může být skenování, sondování nebo
testování systému, který nevlastníte nebo k němuž nemáte oprávnění, ve vaší jurisdikci
**nezákonné** a může porušovat podmínky použití daného cíle. Výhradně vy odpovídáte za to,
že máte svolení **dříve**, než cokoli oskenujete.

RepoGuard **nepoužívejte** proti cizím webům, sdílenému hostingu, který nespravujete, ani
proti jakémukoli systému bez oprávnění.

## Bez záruky

Software je poskytován **„tak jak je", bez jakékoli záruky**, výslovné či předpokládané,
včetně mimo jiné záruk prodejnosti, vhodnosti pro konkrétní účel a neporušení práv
(viz [MIT `LICENSE`](LICENSE)).

RepoGuard pomáhá najít běžné problémy, ale **není zárukou bezpečnosti**. Může přehlédnout
skutečné problémy (falešně negativní) i nahlásit věci, které ve vašem kontextu nejsou zneužitelné
(falešně pozitivní). Je jedním z podkladů pro vaši vlastní kontrolu — nenahrazuje ji.

## Žádná odpovědnost

V maximálním rozsahu povoleném zákonem autoři a přispěvatelé **nenesou žádnou odpovědnost** za
jakékoli nároky, škody či jinou odpovědnost — včetně výpadků, ztráty dat, přerušení provozu,
nákladů nebo právních následků — vzniklé v souvislosti s použitím tohoto softwaru nebo s
jakýmkoli skenem, který s ním spustíte. **RepoGuard používáte na vlastní riziko a na vlastní
odpovědnost.**

## Stručně

- ✅ Vaše vlastní repozitáře a vaše vlastní servery.
- ✅ Systémy, k jejichž testování máte písemné svolení.
- ❌ Cizí systémy bez oprávnění.
- ⚠️ Poskytováno „tak jak je", bez záruky, bez odpovědnosti. Za způsob použití odpovídáte vy.
