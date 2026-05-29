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
        <h2 className="font-display text-2xl sm:text-3xl text-gold-500 mb-4">ELIMINATÒRIES</h2>
        <p className="text-pitch-300 mb-4 text-sm sm:text-base">32ens → 8ens → Quarts → Semis → 3r lloc → Final (32 partits)</p>
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
        <h2 className="font-display text-2xl sm:text-3xl text-gold-500 mb-4">PREDICCIONS ESPECIALS</h2>
        <p className="text-pitch-300 mb-4 text-sm sm:text-base">Cal omplir abans del primer partit del torneig</p>
        <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full text-left min-w-[280px]">
          <thead>
            <tr className="border-b border-pitch-700 text-pitch-400">
              <th className="py-2">Predicció</th>
              <th className="py-2 text-right">Punts</th>
            </tr>
          </thead>
          <tbody className="text-pitch-200">
            <tr className="border-b border-pitch-800/50"><td className="py-3">Campió del torneig</td><td className="py-3 text-right font-bold text-gold-400">{s.champion} pts</td></tr>
            <tr className="border-b border-pitch-800/50"><td className="py-3">Subcampió</td><td className="py-3 text-right font-bold text-gold-400">{s.runnerUp} pts</td></tr>
            <tr className="border-b border-pitch-800/50"><td className="py-3">3r lloc</td><td className="py-3 text-right font-bold text-gold-400">{s.thirdPlace} pts</td></tr>
            <tr className="border-b border-pitch-800/50"><td className="py-3">Màxim golejador</td><td className="py-3 text-right font-bold text-gold-400">{s.topScorer} pts</td></tr>
            <tr className="border-b border-pitch-800/50"><td className="py-3">Total gols del torneig (exacte)</td><td className="py-3 text-right font-bold text-gold-400">{s.totalGoalsExact} pts</td></tr>
            <tr className="border-b border-pitch-800/50"><td className="py-3">Total gols (±5 gols)</td><td className="py-3 text-right font-bold text-gold-400">{s.totalGoalsWithin5} pts</td></tr>
            <tr className="border-b border-pitch-800/50"><td className="py-3">Ordre exacte d&apos;un grup (1r-2n-3r-4t)</td><td className="py-3 text-right font-bold text-gold-400">{s.groupExactOrder} pts/grup</td></tr>
            <tr className="border-b border-pitch-800/50"><td className="py-3">Equip classificat al top 2 (per grup, sense ordre)</td><td className="py-3 text-right font-bold text-gold-400">{s.groupTopTwo} pts/equip</td></tr>
            <tr><td className="py-3">3r classificat del grup passa d&apos;eliminatoria</td><td className="py-3 text-right font-bold text-gold-400">{s.groupThirdQualifies} pts/grup</td></tr>
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
