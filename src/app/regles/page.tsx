import { SCORING_RULES, PHASE_LABELS } from "@/data/world-cup-2026";

export default function RulesPage() {
  const g = SCORING_RULES.group;
  const k = SCORING_RULES.knockout;
  const s = SCORING_RULES.special;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
      <h1 className="font-display text-4xl sm:text-5xl text-pitch-400 text-center mb-6 sm:mb-8">REGLAMENT</h1>

      <section className="card-glass rounded-2xl p-4 sm:p-8 mb-6 sm:mb-8">
        <h2 className="font-display text-2xl sm:text-3xl text-gold-500 mb-4">GENERAL</h2>
        <ul className="space-y-2 text-pitch-200">
          <li>• Entre <strong className="text-white">8 i 12 participants</strong></li>
          <li>• Quota d&apos;entrada: <strong className="text-white">15€</strong> per persona</li>
          <li>• Repartiment de premis: <strong className="text-white">50% · 30% · 20%</strong> (1r, 2n, 3r)</li>
          <li>• Cal predir el <strong className="text-white">marcador exacte</strong> de cada partit (gols en 90 minuts)</li>
          <li>• Les prediccions es tanquen quan comença el partit (l&apos;admin pot bloquejar manualment)</li>
          <li>• En eliminatòries: resultat després de pròrroga compta com a empat en 90 min si aplica</li>
        </ul>
      </section>

      <section className="card-glass rounded-2xl p-4 sm:p-8 mb-6 sm:mb-8">
        <h2 className="font-display text-2xl sm:text-3xl text-gold-500 mb-4">FASE DE GRUPS — PARTITS</h2>
        <p className="text-pitch-300 mb-4 text-sm sm:text-base">72 partits · 12 grups de 4 equips</p>
        <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full text-left min-w-[280px]">
          <thead>
            <tr className="border-b border-pitch-700 text-pitch-400">
              <th className="py-2">Encert</th>
              <th className="py-2 text-right">Punts</th>
            </tr>
          </thead>
          <tbody className="text-pitch-200">
            <tr className="border-b border-pitch-800/50"><td className="py-3">Marcador exacte</td><td className="py-3 text-right font-bold text-pitch-400">{g.exact} pts</td></tr>
            <tr className="border-b border-pitch-800/50"><td className="py-3">Resultat correcte (1/X/2) + diferència de gols</td><td className="py-3 text-right font-bold text-pitch-400">{g.resultAndDiff} pts</td></tr>
            <tr><td className="py-3">Resultat correcte (1/X/2) només</td><td className="py-3 text-right font-bold text-pitch-400">{g.resultOnly} pt</td></tr>
          </tbody>
        </table>
        </div>
        <p className="text-sm text-pitch-500 mt-4">Màxim teòric fase grups: 72 × 4 = 288 punts</p>
      </section>

      <section className="card-glass rounded-2xl p-4 sm:p-8 mb-6 sm:mb-8">
        <h2 className="font-display text-2xl sm:text-3xl text-gold-500 mb-4">MILLORS 3RS CLASSIFICATS</h2>
        <p className="text-pitch-300 mb-4 text-sm sm:text-base">
          Del Mundial 2026 passen els <strong className="text-white">8 millors 3rs</strong> (12 grups → 8 passen, 4 queden fora).
          Es calcula automàticament dels marcadors de grups (predicció o resultats reals): punts, diferència de gols i gols a favor.
        </p>
        <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full text-left min-w-[280px]">
          <thead>
            <tr className="border-b border-pitch-700 text-pitch-400">
              <th className="py-2">Encert</th>
              <th className="py-2 text-right">Punts</th>
            </tr>
          </thead>
          <tbody className="text-pitch-200">
            <tr><td className="py-3">El 3r del grup passa o no (per grup complet)</td><td className="py-3 text-right font-bold text-gold-400">{s.groupThirdQualifies} pts/grup</td></tr>
          </tbody>
        </table>
        </div>
        <p className="text-sm text-pitch-500 mt-4">Màxim teòric millors 3rs: 12 × {s.groupThirdQualifies} = {12 * s.groupThirdQualifies} punts</p>
      </section>

      <section className="card-glass rounded-2xl p-4 sm:p-8 mb-6 sm:mb-8">
        <h2 className="font-display text-2xl sm:text-3xl text-gold-500 mb-4">ELIMINATÒRIES</h2>
        <p className="text-pitch-300 mb-4 text-sm sm:text-base">16ens → 8ens → Quarts → Semis → 3r lloc → Final (32 partits)</p>
        <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full text-left min-w-[280px]">
          <thead>
            <tr className="border-b border-pitch-700 text-pitch-400">
              <th className="py-2">Encert</th>
              <th className="py-2 text-right">Punts</th>
            </tr>
          </thead>
          <tbody className="text-pitch-200">
            <tr className="border-b border-pitch-800/50"><td className="py-3">Marcador exacte (90 min)</td><td className="py-3 text-right font-bold text-pitch-400">{k.exact} pts</td></tr>
            <tr className="border-b border-pitch-800/50"><td className="py-3">Guanyador correcte + diferència de gols</td><td className="py-3 text-right font-bold text-pitch-400">{k.winnerAndDiff} pts</td></tr>
            <tr><td className="py-3">Guanyador correcte</td><td className="py-3 text-right font-bold text-pitch-400">{k.winnerOnly} pts</td></tr>
          </tbody>
        </table>
        </div>
        <p className="text-sm text-pitch-500 mt-4">Màxim teòric eliminatòries: 32 × 8 = 256 punts</p>
      </section>

      <section className="card-glass rounded-2xl p-4 sm:p-8 mb-6 sm:mb-8">
        <h2 className="font-display text-2xl sm:text-3xl text-gold-500 mb-4">PREDICCIONS DEL MUNDIAL</h2>
        <p className="text-pitch-300 mb-4 text-sm sm:text-base">
          MVP, golejadors, selecció sorpresa… El podi (campió, subcampió, 3r) es calcula de les teves prediccions d&apos;eliminatòries.
        </p>
        <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full text-left min-w-[280px]">
          <thead>
            <tr className="border-b border-pitch-700 text-pitch-400">
              <th className="py-2">Predicció</th>
              <th className="py-2 text-right">Punts</th>
            </tr>
          </thead>
          <tbody className="text-pitch-200">
            <tr className="border-b border-pitch-800/50"><td className="py-3">Campió (de la teva final)</td><td className="py-3 text-right font-bold text-gold-400">{s.champion} pts</td></tr>
            <tr className="border-b border-pitch-800/50"><td className="py-3">Subcampió (de la teva final)</td><td className="py-3 text-right font-bold text-gold-400">{s.runnerUp} pts</td></tr>
            <tr className="border-b border-pitch-800/50"><td className="py-3">3r lloc (del teu partit 3r/4t)</td><td className="py-3 text-right font-bold text-gold-400">{s.thirdPlace} pts</td></tr>
            <tr className="border-b border-pitch-800/50"><td className="py-3">MVP del Mundial</td><td className="py-3 text-right font-bold text-gold-400">{s.mvp} pts</td></tr>
            <tr className="border-b border-pitch-800/50"><td className="py-3">MVP jove</td><td className="py-3 text-right font-bold text-gold-400">{s.youngMvp} pts</td></tr>
            <tr className="border-b border-pitch-800/50"><td className="py-3">Màxim golejador</td><td className="py-3 text-right font-bold text-gold-400">{s.topScorer} pts</td></tr>
            <tr className="border-b border-pitch-800/50"><td className="py-3">Màxim assistent</td><td className="py-3 text-right font-bold text-gold-400">{s.topAssists} pts</td></tr>
            <tr className="border-b border-pitch-800/50"><td className="py-3">Guant d&apos;or (porter)</td><td className="py-3 text-right font-bold text-gold-400">{s.goldenGlove} pts</td></tr>
            <tr className="border-b border-pitch-800/50"><td className="py-3">Selecció sorpresa</td><td className="py-3 text-right font-bold text-gold-400">{s.surpriseTeam} pts</td></tr>
            <tr className="border-b border-pitch-800/50"><td className="py-3">Primer favorit eliminat</td><td className="py-3 text-right font-bold text-gold-400">{s.firstEliminatedFavorite} pts</td></tr>
            <tr className="border-b border-pitch-800/50"><td className="py-3">Ordre exacte d&apos;un grup (dels teus marcadors)</td><td className="py-3 text-right font-bold text-gold-400">{s.groupExactOrder} pts/grup</td></tr>
            <tr className="border-b border-pitch-800/50"><td className="py-3">Equip al top 2 (per grup)</td><td className="py-3 text-right font-bold text-gold-400">{s.groupTopTwo} pts/equip</td></tr>
          </tbody>
        </table>
        </div>
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

function PrizeExample({ n }: { n: number }) {
  const pool = n * 15;
  return (
    <div className="bg-pitch-900/50 rounded-xl p-4">
      <div className="font-display text-2xl text-white">{n} jugadors</div>
      <div className="text-gold-400 font-bold text-xl">{pool}€ total</div>
      <div className="text-sm text-pitch-400 mt-2">
        1r: {Math.round(pool * 0.5)}€<br />
        2n: {Math.round(pool * 0.3)}€<br />
        3r: {Math.round(pool * 0.2)}€
      </div>
    </div>
  );
}
