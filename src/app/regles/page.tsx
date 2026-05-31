import { SCORING_RULES, ALL_MATCHES, getTeamInfo } from "@/data/world-cup-2026";
import {
  ENTRY_FEE,
  FIFA_TOP_10_CODES,
  PRIZE_SPLIT,
  RULES_NOTES,
} from "@/data/rules-config";
import { buildSubmissionDeadlineRows } from "@/lib/prediction-deadlines";

export default function RulesPage() {
  const g = SCORING_RULES.group;
  const k = SCORING_RULES.knockout;
  const s = SCORING_RULES.special;
  const submissionDeadlines = buildSubmissionDeadlineRows(ALL_MATCHES);

  const top10Names = FIFA_TOP_10_CODES.map((c) => getTeamInfo(c).name).join(", ");

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
      <h1 className="font-display text-4xl sm:text-5xl text-pitch-400 text-center mb-2">REGLAMENT</h1>
      <p className="text-center text-pitch-500 text-sm mb-8">Porra Mundial 2026 — normes oficials</p>

      <section className="card-glass rounded-2xl p-4 sm:p-8 mb-6 sm:mb-8">
        <h2 className="font-display text-2xl sm:text-3xl text-gold-500 mb-4">GENERAL</h2>
        <ul className="space-y-2 text-pitch-200 text-sm sm:text-base mb-6">
          <li>• Preu d&apos;entrada: <strong className="text-white">{ENTRY_FEE}€</strong></li>
          <li>• Repartiment de premis: <strong className="text-white">{PRIZE_SPLIT.first}% · {PRIZE_SPLIT.second}% · {PRIZE_SPLIT.third}%</strong> (1r, 2n, 3r)</li>
          <li className="text-pitch-400 text-sm">{RULES_NOTES.prizesNote}</li>
          <li>• Cal predir el <strong className="text-white">marcador exacte</strong> de cada partit (90 minuts)</li>
        </ul>

        <h3 className="font-display text-lg text-pitch-300 mb-3">Límits d&apos;entrega</h3>
        <DeadlineTable rows={submissionDeadlines.map((d) => [d.phase, d.limit])} />
        <p className="text-pitch-500 text-xs mt-3">
          Cada ronda eliminatòria s&apos;ha de predir dins la finestra entre el darrer partit de la fase anterior
          i l&apos;inici del primer partit de la ronda següent.
        </p>
      </section>

      <section className="card-glass rounded-2xl p-4 sm:p-8 mb-6 sm:mb-8">
        <h2 className="font-display text-2xl sm:text-3xl text-gold-500 mb-4">FASE DE GRUPS</h2>
        <p className="text-pitch-300 mb-4 text-sm">72 partits · 12 grups de 4 equips</p>

        <h3 className="font-display text-lg text-pitch-300 mb-3">Partits</h3>
        <RulesTable rows={[
          ["Resultat correcte (1 / X / 2)", `${g.outcome} pt`],
          ["Bonus marcador exacte (s'acumula)", `+${g.exact} pts`],
          ["Total si encertes l'exacte", `${g.outcome + g.exact} pts`],
        ]} />

        <h3 className="font-display text-lg text-pitch-300 mb-3 mt-6">Classificació de grups</h3>
        <p className="text-pitch-400 text-sm mb-3">
          L&apos;ordre de grups i els millors 3rs es calculen automàticament dels teus marcadors.
        </p>
        <RulesTable rows={[
          ["Ordre exacte d'un grup (4 posicions)", `${s.groupExactOrder} pts`],
          ["Encertar un 3r que NO passa (dels 4 que queden fora)", `${s.nonQualifyingThird} pts`],
          ["Selecció amb més gols (GF) a fase de grups", `${s.mostGroupGoals} pts`],
          ["Selecció amb més gols encaixats (GC) a fase de grups", `${s.mostGroupGoalsConceded} pts`],
        ]} />
        <p className="text-pitch-500 text-xs mt-3">
          En cas d&apos;empat en GF o GC a grups, es desempata per ordre alfabètic del codi de selecció.
        </p>
      </section>

      <section className="card-glass rounded-2xl p-4 sm:p-8 mb-6 sm:mb-8">
        <h2 className="font-display text-2xl sm:text-3xl text-gold-500 mb-4">PUNTUACIONS ESPECIALS</h2>
        <p className="text-pitch-300 mb-4 text-sm">
          Jugadors i seleccions (tot el que no són partits ni classificació de grups).
        </p>
        <RulesTable rows={[
          ["Màxim golejador", `${s.topScorer} pts`],
          ["Màxim assistent", `${s.topAssists} pts`],
          ["Millor porter", `${s.goldenGlove} pts`],
          ["Millor jugador (MVP)", `${s.mvp} pts`],
          ["Millor jugador jove", `${s.youngMvp} pts`],
          ["Selecció revelació", `${s.surpriseTeam} pts`],
          ["Selecció decepció", `${s.disappointmentTeam} pts`],
        ]} />
        <div className="mt-4 space-y-2 text-sm text-pitch-400">
          <p>{RULES_NOTES.youngPlayer}</p>
          <p>{RULES_NOTES.topScorerTie}</p>
          <p><strong className="text-pitch-300">Top 10 FIFA</strong> (31 maig 2026): {top10Names}</p>
          <p>{RULES_NOTES.surpriseTeam}</p>
          <p>{RULES_NOTES.disappointmentTeam}</p>
        </div>
      </section>

      <section className="card-glass rounded-2xl p-4 sm:p-8 mb-6 sm:mb-8">
        <h2 className="font-display text-2xl sm:text-3xl text-gold-500 mb-4">ELIMINATÒRIES — PARTITS</h2>
        <p className="text-pitch-300 mb-4 text-sm">
          32ens → 16ens → Quarts → Semis → 3r lloc → Final. A la pestanya{" "}
          <strong className="text-pitch-200">Marcadors</strong> introdueix el resultat a 90 minuts abans de cada ronda.
        </p>
        <RulesTable rows={[
          ["Resultat correcte (1 / X / 2)", `${k.outcome} pt`],
          ["Bonus marcador exacte (s'acumula)", `+${k.exact} pts`],
          ["Total si encertes l'exacte", `${k.outcome + k.exact} pts`],
        ]} />

        <h3 className="font-display text-lg text-pitch-300 mb-3 mt-6">Classificats per ronda</h3>
        <p className="text-pitch-400 text-sm mb-3">
          A la pestanya <strong className="text-pitch-200">Quadre</strong>, clica la bandera de qui passa de ronda
          (inclou final i partit del 3r lloc). D&apos;aquí es sumen els punts de classificació i podi.
        </p>
        <RulesTable rows={[
          ["Per equip encertat que classifica a 16ens", `${s.round16Finalist} pt/equip`],
          ["Per equip encertat que classifica a quarts", `${s.quarterFinalist} pts/equip`],
          ["Per equip encertat que classifica a semis", `${s.semiFinalist} pts/equip`],
          ["Encertar guanyador del partit del 3r lloc", `${s.thirdPlace} pts`],
          ["Encertar el campió", `${s.champion} pts`],
        ]} />
      </section>

      <section className="card-glass rounded-2xl p-4 sm:p-8">
        <h2 className="font-display text-2xl sm:text-3xl text-gold-500 mb-4">PREMIS — EXEMPLES</h2>
        <div className="grid sm:grid-cols-3 gap-4 text-center">
          <PrizeExample n={8} />
          <PrizeExample n={10} />
          <PrizeExample n={12} />
        </div>
      </section>
    </div>
  );
}

function RulesTable({ rows }: { rows: [string, string][] }) {
  return (
    <div className="overflow-x-auto -mx-2 px-2">
      <table className="w-full text-left min-w-[280px]">
        <thead>
          <tr className="border-b border-pitch-700 text-pitch-400">
            <th className="py-2">Concepte</th>
            <th className="py-2 text-right">Punts</th>
          </tr>
        </thead>
        <tbody className="text-pitch-200">
          {rows.map(([label, pts]) => (
            <tr key={label} className="border-b border-pitch-800/50">
              <td className="py-3">{label}</td>
              <td className="py-3 text-right font-bold text-gold-400">{pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DeadlineTable({ rows }: { rows: [string, string][] }) {
  return (
    <div className="overflow-x-auto -mx-2 px-2">
      <table className="w-full text-left min-w-[280px]">
        <thead>
          <tr className="border-b border-pitch-700 text-pitch-400">
            <th className="py-2 pr-4">Fase</th>
            <th className="py-2">Límit d&apos;entrega</th>
          </tr>
        </thead>
        <tbody className="text-pitch-200">
          {rows.map(([phase, limit]) => (
            <tr key={phase} className="border-b border-pitch-800/50">
              <td className="py-3 pr-4 font-medium text-pitch-100 whitespace-nowrap">{phase}</td>
              <td className="py-3 text-pitch-300">{limit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PrizeExample({ n }: { n: number }) {
  const pool = n * ENTRY_FEE;
  const first = Math.round(pool * PRIZE_SPLIT.first / 100);
  const second = Math.round(pool * PRIZE_SPLIT.second / 100);
  const third = pool - first - second;
  return (
    <div className="bg-pitch-900/50 rounded-xl p-4">
      <div className="font-display text-2xl text-white">{n} jugadors</div>
      <div className="text-gold-400 font-bold text-xl">{pool}€ total</div>
      <div className="text-sm text-pitch-400 mt-2">
        1r: {first}€<br />
        2n: {second}€<br />
        3r: {third}€
      </div>
    </div>
  );
}
