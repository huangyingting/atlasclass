// The chapter, page by page: text on the left, and for the figure on the right the camera, the one lit thing and
// what is shown. Every number comes from model.js.
import * as M from './model.js';
import { ST, GB } from './world.js';
import { tex } from '../engine/tex.js';

const f = (x, n = 2) => (x < -1e-12 ? '−' : '') + Math.abs(x).toFixed(n);
const tbl = (head, rows) => `<table class="data"><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;
const HT = seq => seq.map(v => v ? 'H' : 'T').join('');
const G = M.GAL, D = M.CARS, W = M.WHEEL, T = M.TXT, TS = M.TEST, P = M.PRIZE, FT = M.FT;
const MID = [4, 5, 6], P_MID = MID.reduce((s, k) => s + M.PMF[k], 0), N_MID = MID.reduce((s, k) => s + M.COUNTS[k], 0);
const L10 = M.LLN_AT;
const S4 = M.SIM4_TRIALS.slice(0, M.SIM4.show);

export const PAGES = [
  {
    kicker: 'Chapter 4', title: 'Probability and random variables', sub: 'chance, counted',
    body: `
      <p class="lede">Chance can’t be predicted one case at a time, but it can in the long run. Probability is the mathematics of that long run.</p>
      <p>In the figure each ball falls through ${G.n} rows of pins. At every pin it goes left or right with equal chance, so no one can say where the next ball will land.</p>
      <p>Yet ${G.balls} balls pile up in a shape that can be predicted. The red marks are the heights expected in each bin, worked out before any ball fell. The middle three bins should hold ${f(100 * P_MID, 1)}% of the balls; they hold ${N_MID} of ${G.balls}, or ${f(100 * N_MID / G.balls, 1)}%.</p>
      <p>This chapter asks when a pattern is just chance, estimates probabilities by simulation, and builds the rules for combining them: complements, “or”, “and”, conditional probability and independence. Then it turns outcomes into numbers. A <b>random variable</b> has a distribution with a mean and a standard deviation, and these combine in fixed ways. Two distributions come up again and again: the <b>binomial</b> (the board in the figure) and the <b>geometric</b>.</p>`,
    cam: { target: [GB.cx, 3.0, 0], az: -7, el: 6, dist: 37 }, lit: 'balls', look: {}, scene: 'galton',
    fig: 'A Galton board',
  },
  {
    kicker: '4.1', title: 'Random and non-random patterns', sub: 'is it just chance?',
    body: `
      <p class="lede">A <b>random process</b> generates outcomes by chance. Streaks and clusters are part of what it produces, so a pattern in random data need not mean anything.</p>
      <p>One grid in the figure is ${M.RUNS.n} tosses of a fair coin. The other was written down by a person trying to look random. People avoid streaks, and that gives them away:</p>
      ${tbl(['', 'real tosses', 'made up'], [['heads', M.HEADS_REAL, M.HEADS_INV], ['switches H ↔ T', M.REAL_SW, M.INV_SW], ['longest run', M.REAL_RUN.len, M.INV_RUN.len]])}
      <p>After each toss of a fair coin, the next one switches with probability 1/2, so about ${(M.RUNS.n - 1) / 2} switches are typical. The made-up sequence switches ${M.INV_SW} times; the real one ${M.REAL_SW}.</p>
      <p><b>How often does chance alone do this?</b> In ${M.RUNS.sims.toLocaleString('en-US')} simulated sets of ${M.RUNS.n} fair tosses (the bars), ${f(100 * M.P_GE5, 0)}% had a run of 5 or more. Only ${f(100 * M.P_LE_INV, 1)}% had a longest run of ${M.INV_RUN.len} or less. The run of ${M.REAL_RUN.len} tails is ordinary. The made-up sequence is the unusual one.</p>
      <p>So a basketball player’s streak, or a cluster of illnesses in one town, is not evidence of anything on its own. First ask how often random chance would produce a pattern like it. That question runs through the rest of the course.</p>`,
    cam: { target: [ST.runs - 0.3, 3.6, 0], az: 0, el: 3, dist: 44 }, lit: 'longest', look: {}, scene: 'runs',
    fig: 'Which one is random?',
  },
  {
    kicker: '4.2', title: 'Estimating probabilities using simulation', sub: 'the long-run relative frequency',
    body: `
      <p class="lede">The <b>probability</b> of an outcome is the proportion of times it would occur in a very long series of repetitions.</p>
      <p><b>The law of large numbers.</b> As a chance process is repeated more and more times, the relative frequency of an outcome gets closer to its probability. In the figure, run 1 had ${L10[0].sixes} sixes in its first ${L10[0].n} rolls (${f(L10[0].prop, 3)}), ${L10[1].sixes} in ${L10[1].n} (${f(L10[1].prop, 3)}) and ${L10[2].sixes} in ${L10[2].n} (${f(L10[2].prop, 3)}). Every run wanders early and settles near 1/6 ≈ ${f(1 / 6, 3)}.</p>
      <p>This is a statement about the long run only. A die has no memory: after a run without sixes, a six is no more likely. Early deviations are not corrected; they are swamped by the many rolls that follow.</p>
      <p><b>A simulation</b> imitates a chance process to estimate a probability:</p>
      <p>1. Describe how one trial is imitated with random numbers. 2. Say what is recorded. 3. Run many trials. 4. Take the relative frequency as the estimate.</p>
      <p><b>Example.</b> What is the probability of at least one six in four rolls of a die? One trial: four random integers from 1 to 6, each a roll. Record whether any is 6. The first ${M.SIM4.show} trials:</p>
      ${tbl(['trial', ...S4.map((_, i) => i + 1)], [['rolls', ...S4.map(t => t.join(' '))], ['a six?', ...S4.map(t => t.includes(6) ? 'yes' : 'no')]])}
      <p>Of ${M.SIM4.trials} trials, ${M.SIM4_HITS} had a six: an estimate of ${f(M.SIM4_HITS / M.SIM4.trials, 3)}. The exact value (4.3) is 1 − (5/6)<sup>4</sup> = ${f(M.SIM4_EXACT, 3)}. More trials would give an estimate closer to it, on average. With a table of random digits, use 1–6 for the faces and skip 0, 7, 8 and 9.</p>`,
    cam: { target: [ST.lln - 0.2, 2.8, 0], az: 0, el: 3, dist: 44 }, lit: 'path', look: {}, scene: 'lln',
    fig: 'The proportion settles',
  },
  {
    kicker: '4.3', title: 'Introduction to probability', sub: 'sample spaces, events and complements',
    body: `
      <p class="lede">The <b>sample space</b> S of a chance process is the set of all its possible outcomes. An <b>event</b> is a set of outcomes, and its probability is a number from 0 to 1.</p>
      <p>Roll two dice. The sample space has 6 × 6 = 36 outcomes, one tile each in the figure, all <b>equally likely</b>. When outcomes are equally likely,</p>
      <div class="eq">${tex(String.raw`P(A) = \frac{\text{number of outcomes in } A}{\text{number of outcomes in } S}`)}</div>
      <p>The event A, “the sum is 7”, has ${M.SEVENS.length} outcomes (red): (1, 6), (2, 5), (3, 4), (4, 3), (5, 2), (6, 1). So P(A) = ${M.SEVENS.length}/36 = ${f(M.P7, 3)}. The order matters: (1, 6) and (6, 1) are different outcomes.</p>
      <p>Every event has 0 ≤ P(A) ≤ 1, and P(S) = 1: something in S always happens. An event with probability 0 never occurs; one with probability 1 always does.</p>
      <p><b>The complement</b> A<sup>C</sup> is the event that A does not happen. A and A<sup>C</sup> share no outcomes and together fill S, so</p>
      <div class="eq">${tex(String.raw`P(A^C) = 1 - P(A) = 1 - \tfrac{${M.SEVENS.length}}{36} = \tfrac{${36 - M.SEVENS.length}}{36}`)}</div>
      <p>The complement is the quick way to “at least one”. P(at least one six) = 1 − P(no sixes) = 1 − ${36 - M.AT_LEAST_ONE6}/36 = ${M.AT_LEAST_ONE6}/36: count the tiles in the top row and right column, and there are ${M.AT_LEAST_ONE6}.</p>`,
    cam: { target: [ST.dice + 1.0, 3.0, 0], az: 0, el: 4, dist: 34 }, lit: 'sevens', look: {}, scene: 'dice',
    fig: 'Thirty-six outcomes',
  },
  {
    kicker: '4.4', title: 'Mutually exclusive events', sub: 'events that cannot happen together',
    body: `
      <p class="lede">Two events are <b>mutually exclusive</b> (disjoint) when they cannot both occur: P(A ∩ B) = 0.</p>
      <p>The notation: A ∩ B (“A and B”) is the event that both happen; A ∪ B (“A or B”) is the event that at least one happens. In a <b>Venn diagram</b> the rectangle is the sample space, and here areas are drawn to scale: each region’s area is its probability.</p>
      <p>A donor’s ABO blood type is one of four:</p>
      ${tbl(['type', 'O', 'A', 'B', 'AB'], [['probability', ...['O', 'A', 'B', 'AB'].map(k => f(M.BLOOD[k], 2))]])}
      <p>The events “type A” and “type B” are mutually exclusive: no one has both (type AB is a type of its own). Their discs don’t overlap, so the areas simply add:</p>
      <div class="eq">${tex(String.raw`\begin{aligned}P(A \cup B) &= P(A) + P(B) \\ &= ${f(M.BLOOD.A)} + ${f(M.BLOOD.B)} = ${f(M.P_A_OR_B)}\end{aligned}`)}</div>
      <p>The darts in the figure land at random, so the share landing in a region approaches its area: the share in A or B approaches ${f(M.P_A_OR_B)}. The rest, O or AB, has probability ${f(M.BLOOD.O + M.BLOOD.AB)} = 1 − ${f(M.P_A_OR_B)}.</p>
      <p>Only add probabilities this way when the events are mutually exclusive. If they can overlap, the overlap gets counted twice (4.6).</p>`,
    cam: { target: [ST.venn - 5.6, 2.9, 0], az: 0, el: 3, dist: 33 }, lit: 'disjoint', look: {}, scene: 'venn',
    fig: 'No overlap',
  },
  {
    kicker: '4.5', title: 'Conditional probability', sub: 'the probability of A, given B',
    body: `
      <p class="lede">The <b>conditional probability</b> P(A | B) is the probability that A happens, given that B has happened. Knowing B shrinks the sample space to B.</p>
      <p>A survey asked ${M.TOT} drivers whether they had texted while driving in the past month:</p>
      ${tbl(['', T.cols[0], T.cols[1], 'total'], [...T.rows.map((r, i) => [r, ...T.n[i], M.ROWT[i]]), ['total', ...M.COLT, M.TOT]])}
      <p>Choose one driver at random. Let T be “texted” and Y “aged 16–24”. P(T) = ${M.COLT[0]}/${M.TOT} = ${f(M.P_T, 3)}. But given that the driver is 16–24, only that row counts:</p>
      <div class="eq">${tex(String.raw`\begin{aligned}P(T \mid Y) &= \frac{P(T \cap Y)}{P(Y)} = \frac{${T.n[0][0]}/${M.TOT}}{${M.ROWT[0]}/${M.TOT}} \\ &= \frac{${T.n[0][0]}}{${M.ROWT[0]}} = ${f(M.P_T_GIVEN_Y, 3)}\end{aligned}`)}</div>
      <p>The figure on the right shows each row on its own: ${f(M.P_T_GIVEN_Y)} of the young drivers texted, against ${f(M.P_T_GIVEN_O)} of the older ones.</p>
      <p><b>The order matters.</b> P(Y | T) = ${T.n[0][0]}/${M.COLT[0]} = ${f(M.P_Y_GIVEN_T, 3)}: of the drivers who texted, ${f(100 * M.P_Y_GIVEN_T, 1)}% were young. The numerator is the same; the denominator is whatever is given.</p>
      <p>Rearranged, the definition is the <b>multiplication rule</b>, P(A ∩ B) = P(B) · P(A | B): P(T ∩ Y) = ${f(M.P_Y, 2)} × ${f(M.P_T_GIVEN_Y, 2)} = ${f(M.P_TY, 3)} = ${T.n[0][0]}/${M.TOT}.</p>`,
    cam: { target: [ST.table + 0.1, 2.7, 0], az: 0, el: 3, dist: 46 }, lit: 'given', look: {}, scene: 'table',
    fig: 'Given the row',
  },
  {
    kicker: '4.5', title: 'Tree diagrams', sub: 'multiply along the branches, add across them',
    body: `
      <p class="lede">When a chance process happens in stages, a <b>tree diagram</b> shows each stage’s outcomes as branches. The probability of a path is the product of the probabilities along it.</p>
      <p>${f(100 * TS.prev, 0)}% of a population has a condition. A screening test is positive for ${f(100 * TS.sens, 0)}% of people who have it, and for ${f(100 * TS.fpr, 0)}% of people who don’t. The second-stage branches are conditional probabilities: ${TS.sens} is P(+ | condition).</p>
      ${tbl(['path', 'probability', 'per 1000 people'], [['condition, +', `${TS.prev} × ${TS.sens} = ${f(M.LEAVES[0][2], 3)}`, M.NAT[0]], ['condition, −', `${TS.prev} × ${f(1 - TS.sens)} = ${f(M.LEAVES[1][2], 3)}`, M.NAT[1]], ['no condition, +', `${f(1 - TS.prev)} × ${TS.fpr} = ${f(M.LEAVES[2][2], 3)}`, M.NAT[2]], ['no condition, −', `${f(1 - TS.prev)} × ${f(1 - TS.fpr)} = ${f(M.LEAVES[3][2], 3)}`, M.NAT[3]]])}
      <p>Two paths end in a positive test. They are mutually exclusive, so their probabilities add: P(+) = ${f(M.LEAVES[0][2], 3)} + ${f(M.LEAVES[2][2], 3)} = ${f(M.P_POS, 3)}.</p>
      <p>Someone tests positive. What is the probability they have the condition (C)?</p>
      <div class="eq">${tex(String.raw`P(C \mid +) = \frac{P(C \cap +)}{P(+)} = \frac{${f(M.LEAVES[0][2], 3)}}{${f(M.P_POS, 3)}} = ${f(M.P_D_POS, 3)}`)}</div>
      <p>Only about ${f(100 * M.P_D_POS, 0)}%. In 1000 people there are ${M.NAT[0]} true positives and ${M.NAT[2]} false ones: the condition is rare, so the few errors among the many healthy people outnumber the cases. The figure sends ${M.TREE.tokens} people down the tree at random; watch the red and blue leaves.</p>`,
    cam: { target: [ST.tree - 0.2, 3.0, 0], az: 0, el: 3, dist: 42 }, lit: 'positive', look: {}, scene: 'tree',
    fig: 'A screening test',
  },
  {
    kicker: '4.6', title: 'Independent events and unions of events', sub: 'the addition rule, and when knowing one tells nothing',
    body: `
      <p class="lede">Events A and B are <b>independent</b> if knowing that one has happened doesn’t change the probability of the other: P(A | B) = P(A).</p>
      <p>At one school, ${f(100 * M.COURSE.S, 0)}% of students take AP Statistics (S), ${f(100 * M.COURSE.B, 0)}% take AP Biology (B) and ${f(100 * M.COURSE.SB, 0)}% take both. The discs overlap.</p>
      <p><b>The addition rule.</b> Adding P(S) and P(B) counts the overlap (red) twice, so take it off once:</p>
      <div class="eq">${tex(String.raw`\begin{aligned}P(S \cup B) &= P(S) + P(B) \\ &\quad - P(S \cap B) \\ &= ${f(M.COURSE.S)} + ${f(M.COURSE.B)} - ${f(M.COURSE.SB)} \\ &= ${f(M.P_UNION)}\end{aligned}`)}</div>
      <p>So ${f(M.P_NEITHER)} take neither. For mutually exclusive events P(A ∩ B) = 0, and the rule becomes the one in 4.4.</p>
      <p><b>Checking independence.</b> P(S | B) = ${f(M.COURSE.SB)}/${f(M.COURSE.B)} = ${f(M.P_S_GIVEN_B)}, but P(S) = ${f(M.COURSE.S)}. Knowing a student takes Biology raises the chance they take Statistics, so S and B are not independent. The same check in another form: if independent, P(S ∩ B) would equal P(S) · P(B) = ${f(M.P_S_TIMES_B, 4)}, not ${f(M.COURSE.SB)}.</p>
      <p>For independent events, and only then, the multiplication rule becomes P(A ∩ B) = P(A) · P(B). Two separate dice are independent: P(both six) = 1/6 × 1/6 = 1/36.</p>
      <p>Don’t confuse the two ideas. Mutually exclusive events (with positive probabilities) are never independent: if one happens, the other’s probability drops to 0. In 4.5, P(texted | 16–24) = ${f(M.P_T_GIVEN_Y, 3)} ≠ P(texted) = ${f(M.P_T, 3)}, so texting and age group are not independent.</p>`,
    cam: { target: [ST.venn + 5.6, 2.9, 0], az: 0, el: 3, dist: 33 }, lit: 'inter', look: {}, scene: 'venn',
    fig: 'Counted twice',
  },
  {
    kicker: '4.7', title: 'Random variables and probability distributions', sub: 'outcomes as numbers',
    body: `
      <p class="lede">A <b>random variable</b> takes numerical values that depend on the outcome of a chance process. Its <b>probability distribution</b> gives its possible values and their probabilities.</p>
      <p>Let X be the number of cars owned by a randomly chosen household in one town. X is <b>discrete</b>: it takes a list of separate values.</p>
      ${tbl(['<i>x</i>', ...D.x], [['P(X = <i>x</i>)', ...D.p.map(p => f(p))], ['P(X ≤ <i>x</i>)', ...M.CUM.map(p => f(p))]])}
      <p>A valid distribution has every probability between 0 and 1, and they add to 1. In the figure, the bars are P(X = <i>x</i>). The black steps are the <b>cumulative</b> probabilities P(X ≤ <i>x</i>), the bars added from the left.</p>
      <p>Read the words carefully:</p>
      <p>P(X ≥ 2), “at least two”: ${D.p.slice(2).map(p => f(p)).join(' + ')} = ${f(M.P_GE2)}, or 1 − P(X ≤ 1) = 1 − ${f(M.CUM[1])}.<br>P(X > 2), “more than two”: ${f(1 - M.CUM[2])}, without the 2.<br>P(1 ≤ X ≤ 3) = P(X ≤ 3) − P(X ≤ 0) = ${f(M.CUM[3])} − ${f(M.CUM[0])} = ${f(M.P_1TO3)}.</p>
      <p>The red dots are households drawn at random: the share of each value so far. As draws pile up they settle on the bars. This is the law of large numbers again: a probability distribution is the long-run pattern of the values.</p>`,
    cam: { target: [ST.rv + 0.2, 2.4, 0], az: 0, el: 3, dist: 36 }, lit: 'bars', look: {}, scene: 'rv',
    fig: 'X, cars per household',
  },
  {
    kicker: '4.8', title: 'Mean and standard deviation of random variables', sub: 'the balance point, and a typical distance from it',
    body: `
      <p class="lede">The <b>mean</b> (expected value) μ<sub>X</sub> of a random variable is its long-run average value. The <b>standard deviation</b> σ<sub>X</sub> is a typical distance of its values from that mean.</p>
      <p>Each value is weighted by its probability:</p>
      <div class="eq">${tex(String.raw`\begin{aligned}\mu_X &= \sum x_i P(x_i) \\ &= ${D.x.slice(0, 3).map((x, i) => `${x}(${f(D.p[i])})`).join(' + ')} \\ &\quad + ${D.x.slice(3).map((x, i) => `${x}(${f(D.p[i + 3])})`).join(' + ')} = ${f(M.MU_X)} \\ \sigma_X &= \sqrt{\textstyle\sum (x_i - \mu_X)^2 P(x_i)} \\ &= \sqrt{${f(M.SD_X ** 2, 4)}} = ${f(M.SD_X, 3)}\end{aligned}`)}</div>
      <p>The mean is the histogram’s <b>balance point</b> (the red wedge). It need not be a value X can take: no household owns ${f(M.MU_X)} cars.</p>
      <p><b>In context.</b> “If many households were chosen at random, the average number of cars per household would be about ${f(M.MU_X)}.” “The number of cars owned by a randomly chosen household typically varies from the mean of ${f(M.MU_X)} by about ${f(M.SD_X)} cars.”</p>
      <p>The variance is σ<sup>2</sup><sub>X</sub> = ${f(M.SD_X ** 2, 4)}. A shortcut gives the same number: Σ<i>x</i><sup>2</sup>P(<i>x</i>) − μ<sup>2</sup> = ${f(M.EX2, 2)} − ${f(M.MU_X)}<sup>2</sup> = ${f(M.EX2 - M.MU_X ** 2, 4)}.</p>
      <p>Under the axis, the black ball is the mean of all the households drawn so far. It wanders, then settles on μ: the law of large numbers, for means.</p>`,
    cam: { target: [ST.rv + 0.1, 2.0, 0], az: 0, el: 3, dist: 34 }, lit: 'balance', look: {}, scene: 'rv',
    fig: 'The balance point',
  },
  {
    kicker: '4.9', title: 'Combining random variables', sub: 'a linear transformation: Y = a + bX',
    body: `
      <p class="lede">Adding a constant to a random variable shifts its mean and leaves its spread alone. Multiplying by a constant multiplies both.</p>
      <p>A wheel is spun once. X, the number it lands on, has this distribution:</p>
      ${tbl(['<i>x</i>', ...W.x], [['P(X = <i>x</i>)', ...W.p.map(p => f(p, 1))]])}
      <p>μ<sub>X</sub> = ${M.MU_W} and σ<sub>X</sub> = ${M.SD_W}. It costs $${-W.a} to play, and the prize is $${W.b} times the number. The net gain is Y = ${W.b}X − ${-W.a} dollars.</p>
      <div class="eq">${tex(String.raw`\begin{aligned}\mu_{a+bX} &= a + b\mu_X \\ \sigma_{a+bX} &= |b|\,\sigma_X \\ \mu_Y &= ${W.b}(${M.MU_W}) - ${-W.a} = ${f(M.MU_G, 0)} \\ \sigma_Y &= ${W.b}(${M.SD_W}) = ${f(M.SD_G, 0)}\end{aligned}`)}</div>
      <p>The figure does it in two moves. Multiplying by ${W.b} spreads the bars ${W.b} times as far apart: the mean and the standard deviation both triple. Subtracting ${-W.a} slides every bar down by ${-W.a}: the mean moves, the spread doesn’t. Neither move changes the heights, so the shape stays the same.</p>
      <p><b>In context.</b> Over many games a player loses $${f(-M.MU_G, 0)} a game on average. A player wins money only when X ≥ 3: P(Y > 0) = ${f(M.P_WIN, 1)}.</p>
      <p>The variance is multiplied by <i>b</i><sup>2</sup>: σ<sup>2</sup><sub>Y</sub> = ${W.b}<sup>2</sup> × ${M.SD_W ** 2} = ${f(M.SD_G ** 2, 0)}. Adding a constant changes the centre (mean, median, quartiles); multiplying changes the centre and every measure of spread (SD, IQR, range).</p>`,
    cam: { target: [ST.linear, 2.0, 0], az: 0, el: 3, dist: 40 }, lit: 'ydist', look: {}, scene: 'linear',
    fig: 'Stretch, then shift',
  },
  {
    kicker: '4.9', title: 'Sums and differences of random variables', sub: 'means add; for independent variables, variances add',
    body: `
      <p class="lede">The mean of a sum is the sum of the means. When the variables are independent, the variance of a sum, and of a difference, is the sum of the variances.</p>
      <p>Spin the wheel (X, from the page before) and roll a fair die (Y, mean ${M.MU_D}, SD ${f(M.SD_D, 3)}). The spin and the roll are independent. Their total T = X + Y has the distribution in red, found by adding every pair of outcomes.</p>
      <div class="eq">${tex(String.raw`\begin{aligned}\mu_{X+Y} &= \mu_X + \mu_Y = ${M.MU_W} + ${M.MU_D} = ${f(M.MU_T, 1)} \\ \sigma^2_{X+Y} &= \sigma^2_X + \sigma^2_Y \\ &= ${f(M.SD_W ** 2, 3)} + ${f(M.SD_D ** 2, 3)} = ${f(M.SD_T ** 2, 3)} \\ \sigma_{X+Y} &= \sqrt{${f(M.SD_T ** 2, 3)}} = ${f(M.SD_T, 3)}\end{aligned}`)}</div>
      <p>Standard deviations do not add: ${M.SD_W} + ${f(M.SD_D)} = ${f(M.SD_W + M.SD_D)} is too big. They combine like the sides of a right triangle (right of the figure).</p>
      <p><b>Differences.</b> D = Y − X has mean ${M.MU_D} − ${M.MU_W} = ${f(M.MU_DF, 1)}, and its variance is still σ<sup>2</sup><sub>X</sub> + σ<sup>2</sup><sub>Y</sub>, so σ<sub>D</sub> = ${f(M.SD_DF, 3)}. Subtracting a random amount adds variability; it never takes it away.</p>
      <p>The means rule holds for any random variables. The variance rule needs <b>independence</b>. And two spins X<sub>1</sub> + X<sub>2</sub> is not 2X: its SD is √2 σ<sub>X</sub>, while 2X has SD 2σ<sub>X</sub>.</p>
      <p><b>Normal variables.</b> A sum or difference of independent normal random variables is normal. A relay’s two legs take N(${M.RUNW.mu1}, ${M.RUNW.sd1}) and N(${M.RUNW.mu2}, ${M.RUNW.sd2}) minutes. The total is N(${f(M.RUNW_MU, 1)}, ${f(M.RUNW_SD, 1)}), with √(${M.RUNW.sd1}<sup>2</sup> + ${M.RUNW.sd2}<sup>2</sup>) = ${f(M.RUNW_SD, 1)}. P(total < ${M.RUNW_T}) = P(<i>z</i> < ${f(M.RUNW_Z, 2)}) = ${f(M.RUNW_P, 4)}.</p>`,
    cam: { target: [ST.sum - 0.7, 2.4, 0], az: 0, el: 3, dist: 47 }, lit: 'tbars', look: {}, scene: 'sum',
    fig: 'A spin plus a roll',
  },
  {
    kicker: '4.10', title: 'Introduction to the binomial distribution', sub: 'counting successes in n trials',
    body: `
      <p class="lede">A <b>binomial random variable</b> counts the successes in a fixed number of independent trials that each have the same probability of success.</p>
      <p>Check the four conditions (<b>BINS</b>): <b>B</b>inary, each trial a success or a failure; <b>I</b>ndependent trials; a fixed <b>N</b>umber of trials, <i>n</i>; the <b>S</b>ame probability of success, <i>p</i>, on every trial.</p>
      <p>On the board each pin is a trial and “right” is a success: <i>n</i> = ${G.n}, <i>p</i> = ${G.p}. X, the number of rights, is the bin a ball lands in. To land in bin ${M.GK}, a ball must go right at ${M.GK} of the ${G.n} pins. Each such route has probability (1/2)<sup>${G.n}</sup>, and there are C(${G.n}, ${M.GK}) = ${M.PATHS_K} of them:</p>
      <div class="eq">${tex(String.raw`\begin{aligned}P(X = x) &= \binom{n}{x}p^x(1-p)^{n-x} \\ P(X = ${M.GK}) &= \tbinom{${G.n}}{${M.GK}}(0.5)^{${M.GK}}(0.5)^{${G.n - M.GK}} \\ &= \tfrac{${M.PATHS_K}}{${2 ** G.n}} = ${f(M.PMF[M.GK], 3)}\end{aligned}`)}</div>
      <p>Bin ${M.GK} should get ${G.balls} × ${f(M.PMF[M.GK], 3)} ≈ ${f(G.balls * M.PMF[M.GK], 0)} of the balls; it got ${M.COUNTS[M.GK]}.</p>
      <p><b>In context.</b> A player makes ${f(100 * FT.p, 0)}% of her free throws and takes ${FT.n}, which we treat as independent. X, the number made, is binomial with <i>n</i> = ${FT.n}, <i>p</i> = ${FT.p}.</p>
      <p>P(X = ${FT.k}) = C(${FT.n}, ${FT.k})(${FT.p})<sup>${FT.k}</sup>(${f(1 - FT.p, 1)})<sup>${FT.n - FT.k}</sup> = ${f(M.FT_P, 4)}.<br>P(X ≥ ${FT.k}) = 1 − P(X ≤ ${FT.k - 1}) = 1 − ${f(M.FT_LE, 4)} = ${f(M.FT_GE, 4)}: “at least” uses the cumulative probability of the complement.</p>
      <p>Not binomial: drawing cards without replacement (the trials are not independent); counting tosses until the first head (no fixed <i>n</i>: that is 4.12).</p>`,
    cam: { target: [ST.galton + 1.9, 3.0, 0], az: 0, el: 3, dist: 56 }, lit: 'pmf6', look: {}, scene: 'galton',
    fig: 'Ten trials per ball',
  },
  {
    kicker: '4.11', title: 'Parameters for a binomial distribution', sub: 'μ = np, σ = √(np(1 − p))',
    body: `
      <p class="lede">A binomial distribution is fixed by its two parameters, <i>n</i> and <i>p</i>. Its mean and standard deviation follow from them.</p>
      <div class="eq">${tex(String.raw`\mu_X = np \qquad \sigma_X = \sqrt{np(1-p)}`)}</div>
      <p>For the board, μ = ${G.n}(${G.p}) = ${M.MU_B} and σ = √(${G.n} × ${G.p} × ${G.p}) = ${f(M.SD_B, 2)}. The bins within one σ of the mean, ${MID.join(', ')}, hold ${f(M.IN_1SD, 3)} of the probability.</p>
      <p>These are the rules of 4.9 at work. X is a sum of ${G.n} independent trials, each worth 1 with probability <i>p</i> and 0 otherwise. One trial has mean <i>p</i> and variance <i>p</i>(1 − <i>p</i>). Means add, and so do variances.</p>
      <p><b>In context.</b> For the free throws, μ = ${FT.n}(${FT.p}) = ${f(M.FT_MU, 0)} and σ = √(${FT.n} × ${FT.p} × ${f(1 - FT.p, 1)}) = ${f(M.FT_SD, 2)}. “Over many sets of ${FT.n} free throws she makes ${f(M.FT_MU, 0)} on average; the number made typically varies from ${f(M.FT_MU, 0)} by about ${f(M.FT_SD, 2)}.”</p>
      <p><b>Shape.</b> With <i>p</i> = 0.5 the distribution is symmetric. With <i>p</i> near 0 or 1 it is skewed, less so as <i>n</i> grows. When <i>np</i> ≥ 10 and <i>n</i>(1 − <i>p</i>) ≥ 10 it is close to normal, which unit 5 uses.</p>
      <p><b>The 10% condition.</b> Sampling without replacement makes the trials dependent. If the sample is at most 10% of the population, the dependence is slight and the binomial model is still good.</p>`,
    cam: { target: [ST.galton + 7.75, 0.9, 0], az: 0, el: 3, dist: 28 }, lit: 'musd', look: {}, scene: 'galton',
    fig: 'Centre and spread',
  },
  {
    kicker: '4.12', title: 'The geometric distribution', sub: 'trials up to the first success',
    body: `
      <p class="lede">A <b>geometric random variable</b> counts the trials up to and including the first success, in independent trials that each have the same probability of success.</p>
      <p>A cereal brand puts a prize in ${f(100 * P.p, 0)}% of its boxes. Open boxes one at a time until you find a prize; X is the number of boxes opened. There is no fixed number of trials, so X is not binomial. To first succeed on trial <i>x</i> (<i>x</i> = 1, 2, 3, …), the first <i>x</i> − 1 trials must fail:</p>
      <div class="eq">${tex(String.raw`\begin{aligned}P(X = x) &= (1-p)^{x-1}p \\ P(X = ${M.G_K}) &= (${f(1 - P.p, 1)})^{${M.G_K - 1}}(${P.p}) = ${f(M.P_G3, 3)}\end{aligned}`)}</div>
      <p>Each bar is ${f(1 - P.p, 1)} times the one before, so the distribution is always skewed right, and its most likely value is always 1.</p>
      <p>P(X ≤ ${M.G_K}) = 1 − P(no prize in the first ${M.G_K}) = 1 − ${f(1 - P.p, 1)}<sup>${M.G_K}</sup> = ${f(M.P_LE3, 3)}.<br>P(X > 5) = ${f(1 - P.p, 1)}<sup>5</sup> = ${f(M.P_GT5, 3)}: the first five boxes all fail.</p>
      <div class="eq">${tex(String.raw`\begin{aligned}\mu_X &= \frac{1}{p} = ${f(M.MU_GE, 0)} \\ \sigma_X &= \frac{\sqrt{1-p}}{p} = \frac{\sqrt{${f(1 - P.p, 1)}}}{${P.p}} = ${f(M.SD_GE, 2)}\end{aligned}`)}</div>
      <p><b>In context.</b> “If this were repeated many times, it would take ${f(M.MU_GE, 0)} boxes on average to find a prize.” The figure plays one run after another: boxes open until the red one, then the ball marks that run’s X.</p>`,
    cam: { target: [ST.geom - 0.2, 2.4, 0], az: 0, el: 3, dist: 40 }, lit: 'gbars', look: {}, scene: 'geom',
    fig: 'Until the first prize',
  },
];

// ---------- click a thing: what it is, with its live numbers ----------
const gal = s => M.countsAt(M.galT(M.clk(s, 'galton')));
const landed = s => gal(s).reduce((a, b) => a + b, 0);
export const PLATES = {
  // runs
  real: { text: `Fifty tosses of a fair coin, read along each row. Black is heads, white tails.`, facts: () => [['heads', `${M.HEADS_REAL} of ${M.RUNS.n}`], ['switches', `${M.REAL_SW}`], ['sequence', HT(M.REAL).replace(/(.{10})/g, '$1 ')]] },
  longest: { text: `The longest run in the real tosses: ${M.REAL_RUN.len} tails in a row. In simulation, ${f(100 * M.P_GE_REAL, 0)}% of sets of 50 fair tosses have a run at least this long.`, facts: () => [['length', `${M.REAL_RUN.len}`], ['tosses', `${M.REAL_RUN.start + 1} to ${M.REAL_RUN.start + M.REAL_RUN.len}`]] },
  invented: { text: `Fifty “tosses” written by a person. They switch too often and never run longer than ${M.INV_RUN.len} (blue): real coins aren’t that tidy.`, facts: () => [['heads', `${M.HEADS_INV} of ${M.RUNS.n}`], ['switches', `${M.INV_SW}`], ['longest run', `${M.INV_RUN.len}`]] },
  simruns: { text: `The longest run in each of ${M.RUNS.sims.toLocaleString('en-US')} simulated sets of 50 fair tosses. The lines mark the real sequence (red) and the made-up one (blue).`, facts: () => [['longest run ≥ 5', f(M.P_GE5, 3)], [`longest run ≤ ${M.INV_RUN.len}`, f(M.P_LE_INV, 4)]] },
  // lln
  path: { text: 'The proportion of sixes after each roll of run 1. Early on one roll moves it a lot; later, hardly at all.', facts: s => { const n = M.llnN(M.clk(s, 'lln')); return [['rolls', `${n}`], ['sixes', `${Math.round(M.PROP[0][n - 1] * n)}`], ['proportion', f(M.PROP[0][n - 1], 3)]]; } },
  others: { text: 'Three other runs of rolls. Each wanders its own way at first, and all close in on 1/6.', facts: s => { const n = M.llnN(M.clk(s, 'lln')); return [1, 2, 3].map(r => [`run ${r + 1}`, f(M.PROP[r][n - 1], 3)]); } },
  truth: { text: 'The probability of a six, 1/6. The long-run proportion settles here; no short run has to.', facts: () => [['1/6', f(1 / 6, 4)]] },
  faces: { text: 'How often each face has come up so far in run 1, as a proportion of the rolls. All six head for 1/6.', facts: s => { const n = M.llnN(M.clk(s, 'lln')); return M.facesAt(n).map((c, k) => [`face ${k + 1}`, `${c} (${f(c / n, 3)})`]); } },
  // dice
  sevens: { text: 'The six outcomes whose sum is 7. Each of the 36 is equally likely, so P(sum is 7) = 6/36.', facts: () => [['outcomes', '6'], ['P(A)', f(M.P7, 4)]] },
  notSeven: { text: 'The complement: every outcome whose sum is not 7.', facts: () => [['outcomes', `${36 - M.SEVENS.length}`], ['P(Aᶜ)', f(M.PNOT7, 4)]] },
  roll: { text: 'One roll of the two dice lands on one of the 36 outcomes, at random. Over many rolls, 1/6 of them are sevens.', facts: s => { const k = M.rollIdx(M.clk(s, 'dice')), [a, b] = M.DROLLS[k]; return [['roll', `${k + 1}`], ['outcome', `(${a}, ${b})`], ['sevens so far', `${M.sevensUpTo(k)} of ${k + 1}`]]; } },
  // venn
  blood: { text: 'The sample space for one donor. Its area stands for probability 1; darts land anywhere in it at random.', facts: s => { const n = M.dartsN(M.clk(s, 'venn')); return [['darts', `${n}`], ['in A', `${M.hits(n, p => M.inC(p, M.LEFT.A))}`], ['in B', `${M.hits(n, p => M.inC(p, M.LEFT.B))}`]]; } },
  disjoint: { text: 'Type A and type B. Their discs share no area: a donor can’t be both, so P(A ∩ B) = 0 and P(A ∪ B) = P(A) + P(B).', facts: () => [['P(A)', f(M.BLOOD.A)], ['P(B)', f(M.BLOOD.B)], ['P(A ∪ B)', f(M.P_A_OR_B)]] },
  courses: { text: 'The sample space for one student. The darts are coloured by where they land: blue S only, black B only, red both.', facts: s => { const n = M.dartsN(M.clk(s, 'venn')); return [['darts', `${n}`], ['in both', `${M.hits(n, p => M.inC(p, M.RIGHT.S) && M.inC(p, M.RIGHT.B))}`]]; } },
  events: { text: 'AP Statistics (blue) and AP Biology (grey), areas drawn to scale.', facts: () => [['P(S)', f(M.COURSE.S)], ['P(B)', f(M.COURSE.B)], ['P(S ∪ B)', f(M.P_UNION)]] },
  inter: { text: 'Students taking both. P(S) + P(B) counts them twice, so the addition rule subtracts P(S ∩ B) once.', facts: () => [['P(S ∩ B)', f(M.COURSE.SB)], ['P(S) · P(B)', f(M.P_S_TIMES_B, 4)], ['independent?', 'no']] },
  // table
  counts: { text: `The counts of the two-way table: ${M.TOT} drivers by age group (along the axis) and by whether they texted (blue) or not (grey).`, facts: () => T.rows.flatMap((r, i) => T.cols.map((c, j) => [`${r}, ${c}`, `${T.n[i][j]}`])) },
  given: { text: 'The 16–24 row on its own, as proportions. Given that a driver is 16–24, the sample space is just these 120.', facts: () => [['P(texted | 16–24)', f(M.P_T_GIVEN_Y, 3)], ['P(texted)', f(M.P_T, 3)]] },
  givenOther: { text: 'The other row on its own: given that a driver is 25 or older.', facts: () => [['P(texted | 25+)', f(M.P_T_GIVEN_O, 3)]] },
  // tree
  branches: { text: 'Each branch carries a probability; the second-stage ones are conditional on the branch before. Multiply along a path.', facts: () => [['P(condition)', `${TS.prev}`], ['P(+ | condition)', `${TS.sens}`], ['P(+ | no condition)', `${TS.fpr}`]] },
  positive: { text: 'The two leaves that end in a positive test: true positives (red) and false positives (blue).', facts: s => { const c = M.leafCounts(M.treeT(M.clk(s, 'tree'))); return [['true positives', `${c[0]}`], ['false positives', `${c[2]}`], ['P(condition | +)', f(M.P_D_POS, 3)]]; } },
  negative: { text: 'The two leaves that end in a negative test.', facts: s => { const c = M.leafCounts(M.treeT(M.clk(s, 'tree'))); return [['condition, −', `${c[1]}`], ['no condition, −', `${c[3]}`]]; } },
  people: { text: 'People sent down the tree one at a time, each branch chosen at random with its probability.', facts: s => { const c = M.leafCounts(M.treeT(M.clk(s, 'tree'))); return [['arrived', `${c.reduce((a, b) => a + b, 0)} of ${M.TREE.tokens}`]]; } },
  // rv
  bars: { text: 'The probability distribution of X: one bar per value, its height the probability. The heights add to 1.', facts: () => D.x.map((x, i) => [`P(X = ${x})`, f(D.p[i])]) },
  cdf: { text: 'The cumulative probabilities P(X ≤ x): a staircase that climbs by each bar’s height and ends at 1.', facts: () => D.x.map((x, i) => [`P(X ≤ ${x})`, f(M.CUM[i])]) },
  draws: { text: 'Households drawn at random: the share with each number of cars so far. As the draws pile up, the dots settle on the bars.', facts: s => { const n = M.rvN(M.clk(s, 'rv')); return [['draws', `${n}`], ...M.obsFreq(n).map((v, i) => [`share with ${D.x[i]}`, f(v, 3)])]; } },
  balance: { text: 'The mean is the balance point: the histogram would balance on the wedge. The ball is the mean of the draws so far.', facts: s => { const n = M.rvN(M.clk(s, 'rv')); return [['μ', f(M.MU_X)], ['mean of the draws', f(M.runMean(n), 3)], ['draws', `${n}`]]; } },
  spread: { text: 'One standard deviation either side of the mean.', facts: () => [['σ', f(M.SD_X, 3)], ['σ²', f(M.SD_X ** 2, 4)]] },
  // linear
  xdist: { text: 'X, the number spun, before the change: values 1 to 4.', facts: () => [['μ', `${M.MU_W}`], ['σ', `${M.SD_W}`]] },
  ydist: { text: 'The same bars after the change. Multiplying by 3 spreads them; subtracting 7 slides them. The heights never change.', facts: s => { const ph = M.linPhase(M.clk(s, 'linear')); return [['mean now', f(M.morph(M.MU_W, ph))], ['SD now', f(M.SD_W * (1 + (W.b - 1) * ph.s))]]; } },
  // sum
  xbars: { text: 'X, the wheel.', facts: () => W.x.map((x, i) => [`P(X = ${x})`, f(W.p[i], 1)]) },
  ybars: { text: 'Y, a fair die: each face 1/6.', facts: () => [['μ', `${M.MU_D}`], ['σ', f(M.SD_D, 3)]] },
  tbars: { text: 'The distribution of X + Y, from all 24 (spin, roll) pairs: the probabilities of the pairs with each total, added.', facts: () => [['μ', f(M.MU_T, 1)], ['σ', f(M.SD_T, 3)], ['P(X + Y = 5)', f(M.TSUM.p[M.TSUM.x.indexOf(5)], 4)]] },
  triangle: { text: 'Variances add, so the standard deviations are the legs and hypotenuse of a right triangle.', facts: () => [['σ_X', `${M.SD_W}`], ['σ_Y', f(M.SD_D, 3)], ['σ_(X+Y)', f(M.SD_T, 3)]] },
  play: { text: 'One play: the spin, the roll and their total, each marked on its own distribution.', facts: s => { const [x, y] = M.PAIRS[M.pairIdx(M.clk(s, 'sum'))]; return [['spin', `${x}`], ['roll', `${y}`], ['total', `${x + y}`]]; } },
  // galton
  pins: { text: `${G.n} rows of pins. At each, a ball goes right with probability ${G.p}, whatever it did before: ${G.n} independent trials.`, facts: () => [['n', `${G.n}`], ['p', `${G.p}`]] },
  balls: { text: 'Each ball’s bin is X, its number of rights. One ball is unpredictable; the pile is not.', facts: s => { const c = gal(s); return [['landed', `${landed(s)} of ${G.balls}`], ...[4, 5, 6].map(k => [`bin ${k}`, `${c[k]}`])]; } },
  expect: { text: `The expected count in each bin: ${G.balls} × P(X = k). The stacks scatter around these.`, facts: () => [4, 5, 6].map(k => [`bin ${k}`, f(G.balls * M.PMF[k], 1)]) },
  pmf: { text: `The binomial distribution with n = ${G.n} and p = ${G.p}: P(X = k) = C(${G.n}, k)(0.5)¹⁰.`, facts: () => M.PMF.slice(0, 6).map((p, k) => [`P(X = ${k})`, f(p, 4)]) },
  pmf6: { text: `P(X = ${M.GK}): ${M.PATHS_K} of the ${2 ** G.n} equally likely routes through the pins end in bin ${M.GK}.`, facts: () => [['C(10, 6)', `${M.PATHS_K}`], ['P(X = 6)', f(M.PMF[M.GK], 4)]] },
  musd: { text: 'The mean np (red) and one standard deviation either side.', facts: () => [['μ = np', `${M.MU_B}`], ['σ = √(np(1 − p))', f(M.SD_B, 3)]] },
  // geom
  gbars: { text: `P(X = x) = (1 − p)^(x−1) p with p = ${P.p}. Each bar is ${1 - P.p} times the one before; they go on for ever, getting smaller.`, facts: () => M.GPMF.slice(0, 5).map((p, k) => [`P(X = ${k + 1})`, f(p, 4)]) },
  gmean: { text: 'The mean, 1/p: the average number of boxes to the first prize over many runs.', facts: () => [['μ', f(M.MU_GE, 0)], ['σ', f(M.SD_GE, 3)]] },
  trials: { text: 'One run: boxes opened in turn until the first prize. (Runs of more than 15 boxes are left out of the picture.)', facts: s => { const g = M.geomAt(M.clk(s, 'geom')); return [['run', `${g.i + 1}`], ['boxes opened', `${g.open}`], ['X', g.done ? `${M.GRUNS[g.i]}` : '…']]; } },
};
