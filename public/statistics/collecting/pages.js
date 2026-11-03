// The chapter, page by page: text on the left, and for the figure on the right the camera, the one lit thing and
// what is shown. Every number comes from model.js.
import * as M from './model.js';
import { ST, MY } from './world.js';
import { tex } from '../engine/tex.js';

const f1 = x => x.toFixed(1), f2 = x => x.toFixed(2), f3 = x => x.toFixed(3);
const n = M.POP.n, ph = '<i>p̂</i>';
const lic = g => M.ALL.filter(i => M.gradeOf(i) === g && M.LIC[i]).length;
const FRAME_LIC = M.FRAME.filter(i => M.LIC[i]).length;
const SHOWN = M.TRIPLES.slice(0, M.DIG.show), FIRST = SHOWN.filter(x => x.why === 'use').map(x => x.v);
const groups5 = M.DIGITS.slice(0, 3 * M.DIG.show).match(/.{1,5}/g);
const pad3 = v => String(v).padStart(3, '0');
const [SA, SB, SC] = M.STRIPS;
const R_LO = Math.min(...M.RDIFFS), R_HI = Math.max(...M.RDIFFS);
const CAF_FIRST = M.PAIR_ORDER.first;
const BL_D = M.BLOCK.drinkers, BL_N = M.BLOCK.n - M.BLOCK.drinkers;

export const PAGES = [
  {
    kicker: 'Chapter 3', title: 'Collecting data', sub: 'samples, experiments and bias',
    body: `
      <p class="lede">What data can tell you depends on how they were collected. A good sample lets you speak for a whole population; a good experiment lets you speak about cause and effect.</p>
      <p>The figure is a school of ${M.N} students, one ball each. The dark ones have a driver’s licence: ${M.COUNT} of them, a share of ${M.P}. Nobody doing a survey would know that number. They would ask a sample.</p>
      <p>A computer draws ${n} students at random (red), and their share with a licence, ${ph}, drops onto the dot plot. Every sample gives a different answer, but the answers pile up around the truth.</p>
      <p>This chapter is about getting data you can trust: how to choose whom to measure, the ways a sample goes wrong, how to design an experiment, and which conclusions each kind of study allows.</p>`,
    cam: { target: [ST.pop, 0.6, 0], az: 0, el: 4, dist: 40 }, lit: 'sample', look: {}, scene: 'pop',
    fig: 'Sampling a school',
  },
  {
    kicker: '3.1', title: 'Introducing statistics', sub: 'do the data we collected tell the truth?',
    body: `
      <p class="lede">Data vary. Two random samples from the same population give different answers, and statistics is the study of that variation.</p>
      <p>The ${M.KPOP} samples of ${n} gave values of ${ph} from ${f2(M.PH_LO)} to ${f2(M.PH_HI)}. None was done wrongly: this is <b>sampling variability</b>, the chance variation of random samples. The values centre on ${f3(M.PH_MEAN)}, close to the true ${M.P}, and their standard deviation is ${f3(M.PH_SD)}.</p>
      <p>So one sample’s answer is an estimate, not the truth. Before you trust a number, ask how it was produced:</p>
      <table class="data">
        <tr><th>question</th><th>why it matters</th></tr>
        <tr><td>Who was measured, and how were they chosen?</td><td>Only a random sample speaks for a population.</td></tr>
        <tr><td>Was a treatment imposed, and who decided who got it?</td><td>Only random assignment shows cause and effect.</td></tr>
        <tr><td>What was measured, and how was it asked?</td><td>A leading question or a bad measurement misleads, however the sample was chosen.</td></tr>
        <tr><td>Could chance alone explain the result?</td><td>Some variation is always there; a pattern must be larger than chance would make.</td></tr>
      </table>
      <p>The first two are this chapter. The last is the rest of the course: whether a result is larger than random variation would plausibly produce.</p>`,
    cam: { target: [ST.pop, -2.7, 0], az: 0, el: 3, dist: 31 }, lit: 'dotplot', look: {}, scene: 'pop',
    fig: 'Every sample a different answer',
  },
  {
    kicker: '3.2', title: 'Introduction to planning a study', sub: 'population, sample and census',
    body: `
      <p class="lede">The <b>population</b> is the whole group you want to know about. A <b>sample</b> is the part of it you actually measure.</p>
      <p>Name the population exactly: “all ${M.N} students at this school”, not “teenagers”. A conclusion reaches only as far as the population that was sampled.</p>
      <p>A <b>census</b> measures every member of the population. For one school it can be done; for a country it is slow and costly, and for some questions impossible (testing every light bulb until it fails leaves none to sell). A well-chosen sample is cheaper and faster, and usually good enough.</p>
      <p>A <b>parameter</b> is a number that describes the population; a <b>statistic</b> describes a sample, and is used to estimate the parameter:</p>
      <div class="eq">${tex(String.raw`p = \frac{${M.COUNT}}{${M.N}} = ${M.P} \qquad \hat{p} = \frac{${Math.round(M.PHATS[0] * n)}}{${n}} = ${f2(M.PHATS[0])}\ \text{(sample 1)}`)}</div>
      <p>Parameters are usually unknown and fixed; statistics are known and vary from sample to sample. Proportions are <i>p</i> and ${ph}; means are μ and <i>x̄</i>.</p>
      <p><b>Generalizing.</b> A result can be extended from a sample to a population only if the sample was chosen at random from that population. Data from whoever was handy describe only those people.</p>`,
    cam: { target: [ST.pop - 0.5, 4.9, 0], az: 0, el: 3, dist: 37 }, lit: 'population', look: {}, scene: 'pop',
    fig: 'The population',
  },
  {
    kicker: '3.2', title: 'Observational studies and experiments', sub: 'watching, or doing something',
    body: `
      <p class="lede">An <b>observational study</b> records what its subjects already do, without changing anything. An <b>experiment</b> deliberately imposes a <b>treatment</b> and measures the response.</p>
      <p>Does coffee before a test help? The same ${M.OBS.n} students are grouped twice. Dark balls slept 8 hours or more.</p>
      <p><b>Top: observational.</b> The students chose. Tired students reach for coffee, so the coffee group has ${M.OBS_COUNTS.obs[0]} of 12 well rested and the other group ${M.OBS_COUNTS.obs[1]} of 12. If the groups score differently, is it the coffee or the sleep? We cannot tell.</p>
      <p>Sleep is a <b>confounding variable</b>: it is associated with the explanatory variable (coffee) and it affects the response (the score), so the two effects cannot be separated.</p>
      <p><b>Bottom: experiment.</b> A random shuffle decided, and sleep had no say: ${M.OBS_COUNTS.exp[0]} and ${M.OBS_COUNTS.exp[1]} well rested. Random assignment tends to balance every other variable between the groups, the ones you know about and the ones you don’t.</p>
      <p>So an observational study can show an <b>association</b>, never cause and effect. A <b>retrospective</b> study looks back at records of the past; a <b>prospective</b> one follows its subjects forward and records as it goes. Sample surveys are observational studies too.</p>
      <p>The rule for the whole chapter: generalizing to a population needs <b>random sampling</b>; concluding cause and effect needs <b>random assignment</b>.</p>`,
    cam: { target: [ST.obs, 0.0, 0], az: 0, el: 3, dist: 41 }, lit: 'obsStudy', look: {}, scene: 'obs',
    fig: 'Chosen, or assigned at random',
  },
  {
    kicker: '3.3', title: 'Random sampling and data collection', sub: 'the simple random sample',
    body: `
      <p class="lede">A <b>simple random sample</b> (SRS) of size <i>n</i> is chosen so that every set of <i>n</i> individuals in the population has the same chance of being the sample.</p>
      <p><b>With a table of random digits:</b></p>
      <p>1. <b>Label</b> each student with a different three-digit number, 001 to ${M.N}.<br>2. <b>Read</b> the digits three at a time.<br>3. <b>Skip</b> 000, numbers above ${M.N}, and repeats, until ${n} students are chosen.</p>
      <table class="data"><tr>${groups5.map(g => `<td>${g}</td>`).join('')}</tr></table>
      <table class="data">
        <tr><th>digits</th>${SHOWN.map(x => `<td>${x.t}</td>`).join('')}</tr>
        <tr><th></th>${SHOWN.map(x => `<td>${x.why === 'use' ? '✓' : x.why === 'repeat' ? 'rep.' : '–'}</td>`).join('')}</tr>
      </table>
      <p>The first ${FIRST.length} students chosen are ${FIRST.map(pad3).join(', ')}. Going on along the table, ${M.TRIPLES.length} groups of three give all ${n}. In this sample ${Math.round(M.SRS_PHAT * n)} of ${n} have a licence: ${ph} = ${f2(M.SRS_PHAT)}.</p>
      <p><b>With a random number generator:</b> generate whole numbers from 1 to ${M.N}, ignoring repeats, until there are ${n}. Or write each name on an identical slip, mix them well in a hat and draw ${n}.</p>
      <p>Samples of people are taken <b>without replacement</b>: once chosen, a student cannot be chosen again. Drawing <b>with replacement</b> puts each one back, so it could be drawn twice.</p>
      <p>In an SRS each student’s chance of being chosen is <i>n</i>/<i>N</i> = ${n}/${M.N} = ${n / M.N}. Equal chances for individuals are not enough, though: the methods on the next page give each student the same ${n / M.N}, but not every set of ${n} is possible.</p>`,
    cam: { target: [ST.methods - 0.6, MY.srs + 0.7, 0], az: 0, el: 3, dist: 36 }, lit: 'srs', look: {}, scene: 'srs',
    fig: 'A simple random sample',
  },
  {
    kicker: '3.3', title: 'Stratified, cluster and systematic samples', sub: 'chance, in steps',
    body: `
      <p class="lede">Other random methods use chance in stages. Each can be cheaper than an SRS, or more precise.</p>
      <p><b>Stratified random sample.</b> Split the population into groups of similar individuals, the <b>strata</b>; take an SRS from each and combine them. Here the strata are the grades, ${M.STRAT_N} students from each.</p>
      <table class="data">
        <tr><th>grade</th>${M.POP.grades.map(g => `<td>${g}</td>`).join('')}</tr>
        <tr><th>with a licence</th>${M.POP.grades.map((_, g) => `<td>${lic(g)} of ${M.PER}</td>`).join('')}</tr>
      </table>
      <p>Strata should be alike within and differ between, as the grades do here. Then every grade gets its share of the sample, and the estimate varies less from sample to sample than an SRS of the same size. This one gave ${ph} = ${f2(M.STRAT_PHAT)}.</p>
      <p><b>Cluster sample.</b> Split the population into groups, usually by location (rooms, streets, boxes): the <b>clusters</b>. Choose some clusters at random and take everyone in them. Here ${M.CLUSTER.take} of the ${M.POP.cols} advisory groups, all ${M.CL_IDX.length} students in them: ${ph} = ${f3(M.CL_PHAT)}. Clusters work best when each is mixed, like a small copy of the population; their gain is cost, one visit per cluster.</p>
      <p>Don’t confuse them: a stratified sample takes <b>some from every</b> stratum; a cluster sample takes <b>all from some</b> clusters.</p>
      <p><b>Systematic random sample.</b> Take every <i>k</i>th individual on a list, from a random start among the first <i>k</i>. Here <i>k</i> = ${M.N}/${n} = ${M.SYS.k}, and the start is ${M.SYS.start}: students ${M.SYS_LABELS.slice(0, 3).join(', ')}, …, ${M.SYS_LABELS.at(-1)}, giving ${ph} = ${f2(M.SYS_PHAT)}. It is quick, and fine unless the list repeats a pattern every <i>k</i> places.</p>`,
    cam: { target: [ST.methods, -3.3, 0], az: 0, el: 3, dist: 55 }, lit: 'strat', look: {}, scene: 'strat',
    fig: 'Strata, clusters, every 10th',
  },
  {
    kicker: '3.4', title: 'Potential problems with sampling', sub: 'the kinds of bias',
    body: `
      <p class="lede">A sampling method is <b>biased</b> if it systematically favours some outcomes: over many samples its statistic misses the parameter in the same direction.</p>
      <p>The school portal lists only grades 10 to 12; grade 9 is not on it yet. The list a sample is actually drawn from is the <b>sampling frame</b>, and leaving part of the population out of it is <b>undercoverage</b>. On the list ${FRAME_LIC} of ${M.FRAME.length} have a licence, ${f3(M.P_FRAME)} against ${M.P} for the school, so samples from it overestimate the share.</p>
      <table class="data">
        <tr><th>bias</th><th>how it happens</th></tr>
        <tr><td>undercoverage</td><td>some of the population is less likely (or unable) to be chosen</td></tr>
        <tr><td>voluntary response</td><td>people choose themselves (an online poll, a call-in); those with strong, often negative, opinions answer most</td></tr>
        <tr><td>convenience</td><td>the easiest to reach are chosen: a survey handed out in the student car park finds mostly drivers</td></tr>
        <tr><td>nonresponse</td><td>people who were chosen can’t be reached or won’t answer, and they differ from those who do</td></tr>
        <tr><td>response bias</td><td>answers are untrue: lying about awkward behaviour, wanting to please the interviewer, misremembering</td></tr>
        <tr><td>question wording</td><td>a leading or confusing question steers the answer: “Don’t you agree that…”</td></tr>
      </table>
      <p>Nonresponse is a problem of who is chosen but doesn’t answer; voluntary response is of who was never chosen at all and answered anyway.</p>
      <p>On the exam, name the bias, explain how it arises in this context, and say which way it pushes the estimate and why.</p>`,
    cam: { target: [ST.bias - 0.6, 7.0, 0], az: 0, el: 3, dist: 36 }, lit: 'frame', look: {}, scene: 'bias',
    fig: 'A frame that leaves people out',
  },
  {
    kicker: '3.4', title: 'Bias and variability', sub: 'off target, and scattered',
    body: `
      <p class="lede">Bias and variability are different faults. Bias is a fault of the method; sampling variability comes with every random sample.</p>
      <p>Forty samples by each method, the parameter <i>p</i> = ${M.P} in blue:</p>
      <table class="data">
        <tr><th>method</th><th>mean of ${ph}</th><th>SD of ${ph}</th></tr>
        ${M.STRIPS.map(S => `<tr><td>${S.name}</td><td>${f3(S.m)}</td><td>${f3(S.s)}</td></tr>`).join('')}
      </table>
      <p><b>Top:</b> centred on <i>p</i>: unbiased, but the answers scatter. <b>Middle</b> (red): drawn from the portal list, they centre near ${f2(SB.m)}. Every sample misses in the same direction; that is bias. <b>Bottom:</b> samples of ${SC.n}, centred on <i>p</i> with less than half the spread of samples of ${SA.n}.</p>
      <p>A larger random sample reduces variability. It does nothing for bias: ${SC.n} students from the portal list would centre near ${f3(M.P_FRAME)} just the same, only more tightly. The cure for bias is a better method; the cure for variability is a larger sample.</p>
      <p>A common mistake: “the sample was too small, so it was biased”. A small random sample is variable, not biased.</p>`,
    cam: { target: [ST.bias, -6.6, 0], az: 0, el: 3, dist: 41 }, lit: 'stripB', look: {}, scene: 'bias',
    fig: 'Biased, variable, both, neither',
  },
  {
    kicker: '3.5', title: 'Introduction to experimental design', sub: 'units, treatments, factors and response',
    body: `
      <p class="lede">An experiment does something to its subjects on purpose and measures how they respond.</p>
      <p>Does caffeine speed up reactions? ${M.EXP.n} volunteers each take a pill, wait, then hit a key when a light flashes.</p>
      <table class="data">
        <tr><th>term</th><th>meaning</th><th>here</th></tr>
        <tr><td><b>experimental units</b></td><td>what the treatments are applied to; people are <b>subjects</b></td><td>the ${M.EXP.n} volunteers</td></tr>
        <tr><td><b>factor</b> (explanatory variable)</td><td>what the experimenter changes</td><td>caffeine</td></tr>
        <tr><td><b>levels</b></td><td>the values a factor is set to</td><td>a caffeine pill, a placebo</td></tr>
        <tr><td><b>treatment</b></td><td>the condition a unit gets: one level of each factor</td><td>2 treatments</td></tr>
        <tr><td><b>response variable</b></td><td>what is measured on each unit</td><td>reaction time (ms)</td></tr>
      </table>
      <p>With two factors, the treatments are the combinations of their levels: caffeine (yes, no) and sleep (4 h, 8 h) would make 2 × 2 = 4 treatments.</p>
      <p>The volunteers were shuffled into two groups of ${M.EXP.n / 2}: a <b>completely randomized design</b>. The <b>control group</b> took the placebo; it shows what happens without the treatment. Mean reaction times: caffeine ${f1(M.MCAF)} ms, placebo ${f1(M.MPLA)} ms.</p>
      <p>The volunteers are not a random sample of anyone: experiments almost always use whoever agrees to take part. That limits how far the result reaches (3.7).</p>`,
    cam: { target: [ST.exp, 1.8, 0], az: 0, el: 3, dist: 37 }, lit: 'units', look: {}, scene: 'exp',
    fig: 'The caffeine experiment',
  },
  {
    kicker: '3.5', title: 'The principles of experimental design', sub: 'comparison, random assignment, control, replication',
    body: `
      <p class="lede">A well-designed experiment rests on four principles.</p>
      <p><b>1. Comparison.</b> At least two treatments, or a treatment and a control group. Reaction time after caffeine means nothing without reaction time after none.</p>
      <p><b>2. Random assignment.</b> Units are assigned to treatments by chance. It balances the other variables that affect the response (sleep, age, practice) between the groups, so a difference left over is due to the treatment or to chance, not to <b>confounding</b>.</p>
      <p><b>3. Control.</b> Keep everything else the same for every unit: the same time of day, the same screen, the same instructions. That removes sources of variation and of confounding.</p>
      <p><b>4. Replication.</b> Enough units in each group that chance differences between them tend to even out. One volunteer per group could show anything.</p>
      <p><b>Placebo and blinding.</b> People respond to being treated at all: the <b>placebo effect</b>. A <b>placebo</b> is a dummy treatment that looks the same as the real one, so both groups expect the same. In a <b>single-blind</b> experiment the subjects (or those measuring them) don’t know who got which; in a <b>double-blind</b> one, neither do.</p>
      <p><b>Describing random assignment</b> (a frequent exam task): number the volunteers 1 to ${M.EXP.n}, write the numbers on identical slips, mix them in a hat and draw ${M.EXP.n / 2}; those get caffeine, the rest the placebo. Say how, with what, and who gets which.</p>`,
    cam: { target: [ST.exp, 2.0, 0], az: 0, el: 3, dist: 36 }, lit: 'groups', look: {}, scene: 'exp',
    fig: 'Assigned by a shuffle',
  },
  {
    kicker: '3.6', title: 'Selecting an experimental design', sub: 'completely randomized and randomized block designs',
    body: `
      <p class="lede">A <b>completely randomized design</b> assigns all the units to treatments at random. A <b>randomized block design</b> first sorts them into <b>blocks</b> of similar units, then assigns at random within each block.</p>
      <p>Regular coffee drinkers may barely respond to one more dose. If, by chance, most of them landed in the caffeine group, the effect would look smaller. So block on coffee habit:</p>
      <table class="data">
        <tr><th>block</th><th>units</th><th>caffeine</th><th>placebo</th></tr>
        <tr><td>coffee drinkers</td><td>${BL_D}</td><td>${BL_D / 2}</td><td>${BL_D / 2}</td></tr>
        <tr><td>non-drinkers</td><td>${BL_N}</td><td>${BL_N / 2}</td><td>${BL_N / 2}</td></tr>
      </table>
      <p>Each block is a small completely randomized experiment, and the treatments are compared within each block. The variation caused by coffee habit is taken out of the comparison, so the treatment effect is estimated more precisely.</p>
      <p>Block on a variable you expect to affect the response. Blocking is to experiments what stratifying is to samples: group similar units first, then use chance inside each group. The blocks are formed before the random assignment, and a block is not a treatment.</p>
      <p>“Control what you can, block what you can’t control, randomize the rest.”</p>`,
    cam: { target: [ST.block, 1.5, 0], az: 0, el: 3, dist: 35 }, lit: 'blocks', look: {}, scene: 'block',
    fig: 'Block, then randomize',
  },
  {
    kicker: '3.6', title: 'Matched pairs design', sub: 'blocks of two',
    body: `
      <p class="lede">A <b>matched pairs design</b> compares two treatments on pairs of very similar units, or on one unit that gets both treatments.</p>
      <p>Here each of ${M.PAIRS.n} volunteers is tested twice, once after each pill, on different days. A coin flip decides the order: ${CAF_FIRST} took caffeine first, ${M.PAIRS.n - CAF_FIRST} the placebo first. People get faster with practice, so a fixed order would mix up the caffeine effect with the practice effect; randomizing the order balances it.</p>
      <table class="data">
        <tr><th>volunteer</th>${M.PAIR_DATA.map((_, j) => `<td>${j + 1}</td>`).join('')}</tr>
        <tr><th>caffeine</th>${M.PAIR_DATA.map(p => `<td>${p.caf}</td>`).join('')}</tr>
        <tr><th>placebo</th>${M.PAIR_DATA.map(p => `<td>${p.pla}</td>`).join('')}</tr>
        <tr><th>difference</th>${M.PAIR_DATA.map(p => `<td>${p.d}</td>`).join('')}</tr>
      </table>
      <p>The analysis uses the <b>differences</b>, placebo minus caffeine, one per volunteer: mean ${f1(M.PD_MEAN)} ms, standard deviation ${f1(M.PD_SD)} ms. Each volunteer serves as their own control, so the large person-to-person differences in reaction time drop out.</p>
      <p>Pairs can also be two units matched closely: twins, two halves of a field, two students of the same score. Then a coin flip decides which of the pair gets which treatment.</p>`,
    cam: { target: [ST.pairs, 2.2, 0], az: 0, el: 3, dist: 33 }, lit: 'subjects', look: {}, scene: 'pairs',
    fig: 'Each volunteer, twice',
  },
  {
    kicker: '3.7', title: 'Inference and experiments', sub: 'is the difference statistically significant?',
    body: `
      <p class="lede">A difference between treatment groups is <b>statistically significant</b> when it is too large to be plausibly explained by the chance of random assignment alone.</p>
      <p>In the caffeine experiment (3.5):</p>
      <div class="eq">${tex(String.raw`\bar{x}_{\text{placebo}} - \bar{x}_{\text{caffeine}} = ${f1(M.MPLA)} - ${f1(M.MCAF)} = ${f1(M.DIFF)}\ \text{ms}`)}</div>
      <p>Even if caffeine did nothing, the two groups of ${M.EXP.n / 2} would differ a little, depending on who happened to land where. How much? Suppose each volunteer would have had the same reaction time with either pill. Deal the ${M.EXP.n} times again at random into two groups of ${M.EXP.n / 2}, and find the difference in means. Do it ${M.RAND.R} times.</p>
      <p>Chance alone gave differences from ${f1(R_LO)} to ${f1(R_HI)} ms, centred near 0; ${M.AS_BIG === 0 ? 'none' : M.AS_BIG} of the ${M.RAND.R} was as large as ${f1(M.DIFF)} ms. So a difference this large is very unlikely to happen by chance alone: it is statistically significant, and it gives convincing evidence that caffeine shortens reaction time for volunteers like these.</p>
      <p>Significant means “not plausibly chance”, not “large” or “important”. And a difference that is not significant does not show that the treatment has no effect; the study may just be too small to see it.</p>`,
    cam: { target: [ST.rand, 0.4, 0], az: 0, el: 3, dist: 34 }, lit: 'randDist', look: {}, scene: 'rand',
    fig: 'What chance alone does',
  },
  {
    kicker: '3.7', title: 'The scope of inference', sub: 'what a study’s design allows you to conclude',
    body: `
      <p class="lede">Random selection lets you generalize to the population the sample came from. Random assignment lets you conclude cause and effect. Each does one job.</p>
      <table class="data">
        <tr><th></th><th>random assignment</th><th>no random assignment</th></tr>
        <tr><th>random selection</th><td>cause and effect, for the population</td><td>association only, for the population</td></tr>
        <tr><th>no random selection</th><td>cause and effect, for units like those studied</td><td>association only, for those studied</td></tr>
      </table>
      <p><b>The caffeine experiment</b> (lit): volunteers, randomly assigned. Caffeine caused the faster reactions, but only for people like these volunteers.</p>
      <p><b>The licence survey</b>: an SRS of the school, no treatment. The sample’s share estimates the school’s; nothing about cause.</p>
      <p><b>The coffee study that let students choose</b> (3.2): neither. It shows an association among those students, which sleep may explain.</p>
      <p>Common mistakes: claiming a randomized experiment on volunteers applies to everyone; claiming cause from a large random survey. A big sample does not replace random assignment, and random assignment does not replace random selection.</p>`,
    cam: { target: [ST.scope + 0.2, 0.2, 0], az: 0, el: 3, dist: 40 }, lit: 'scopeAsg', look: {}, scene: 'scope',
    fig: 'Selection and assignment',
  },
];

// ---------- click a thing: what it is, with its live numbers ----------
const popNow = s => { const st = M.popAt(M.clk(s, 'pop')); return Math.min(st.k, M.KPOP - 1); };
const shown = (key, s) => M.shownOf(key, M.clk(s, key));
const scopeText = {
  scopeBoth: 'A random sample, randomly assigned to treatments: the strongest design. A significant difference shows cause and effect, and the conclusion extends to the population sampled.',
  scopeSel: 'A random sample, no treatments imposed (a survey). The results generalize to the population, but an association is all they show.',
  scopeAsg: 'Volunteers, randomly assigned: most experiments. A significant difference shows cause and effect, but only for units like those in the study.',
  scopeNone: 'Volunteers, groups as they come: no random anything. The data describe these subjects only, and show only association.',
};
export const PLATES = {
  population: { text: `Every student at the school, one ball each: the population. Dark balls have a driver’s licence. The parameter p is their share: ${M.COUNT}/${M.N}.`,
    facts: () => [['students', `${M.N}`], ['with a licence', `${M.COUNT}`], ['p', `${M.P}`]] },
  sample: { text: `The ${n} students in this sample, licence holders first. Every set of ${n} students had the same chance of being the one drawn.`,
    facts: s => { const k = popNow(s); return [['sample', `${k + 1}`], ['with a licence', `${Math.round(M.PHATS[k] * n)} of ${n}`], ['p̂', f2(M.PHATS[k])]]; } },
  dotplot: { text: 'One dot for each sample’s p̂. They scatter around p by chance: sampling variability.', facts: () => [['samples', `${M.KPOP}`], ['mean of p̂', f3(M.PH_MEAN)], ['SD of p̂', f3(M.PH_SD)]] },
  param: { text: 'The parameter: the share of the whole school with a licence. Fixed, and in practice unknown.', facts: () => [['p', `${M.P}`]] },
  obsStudy: { text: 'The students chose for themselves. Tired ones chose coffee, so sleep is tangled up with coffee: a confounding variable.', facts: () => [['well rested, coffee', `${M.OBS_COUNTS.obs[0]} of 12`], ['well rested, none', `${M.OBS_COUNTS.obs[1]} of 12`]] },
  expStudy: { text: 'A random shuffle chose. Sleep is roughly balanced between the groups, so it cannot explain a difference between them.', facts: () => [['well rested, coffee', `${M.OBS_COUNTS.exp[0]} of 12`], ['well rested, none', `${M.OBS_COUNTS.exp[1]} of 12`]] },
  srs: { text: `Students labelled 001–${M.N}, chosen by reading random digits three at a time, skipping repeats and numbers out of range.`, facts: s => [['chosen', `${M.SRS_IDX.slice(0, shown('srs', s)).length} of ${n}`], ['p̂', f2(M.SRS_PHAT)]] },
  strat: { text: `An SRS of ${M.STRAT_N} within each grade. Licence holding differs sharply between grades, so this keeps the estimate steadier than an SRS.`, facts: () => M.POP.grades.map((g, k) => [`grade ${g}`, `${M.STRAT[k].filter(i => M.LIC[i]).length} of ${M.STRAT_N} with a licence`]) },
  cluster: { text: `${M.CLUSTER.take} advisory groups chosen at random and every student in them taken. Each group has two students from every grade, so each is a small copy of the school.`, facts: () => [['groups', M.CL_GROUPS.map(g => g + 1).join(', ')], ['students', `${M.CL_IDX.length}`], ['p̂', f3(M.CL_PHAT)]] },
  sys: { text: `A random start among the first ${M.SYS.k}, then every ${M.SYS.k}th student on the list.`, facts: () => [['start', `${M.SYS.start}`], ['k', `${M.SYS.k}`], ['p̂', f2(M.SYS_PHAT)]] },
  frame: { text: 'The list samples are drawn from. Grade 9 is missing from it: undercoverage. They can never be chosen, and few of them drive.', facts: () => [['on the list', `${M.FRAME.length} of ${M.N}`], ['share with a licence', f3(M.P_FRAME)], ['whole school', `${M.P}`]] },
  stripA: { text: 'Samples of 20 from the whole school: centred on p (unbiased), but spread out.', facts: () => [['mean of p̂', f3(SA.m)], ['SD', f3(SA.s)]] },
  stripB: { text: 'Samples of 20 from the portal list: they centre too high. Bias: every sample misses the same way.', facts: () => [['mean of p̂', f3(SB.m)], ['SD', f3(SB.s)], ['list’s share', f3(M.P_FRAME)]] },
  stripC: { text: 'Samples of 80 from the whole school: still centred on p, and less spread. A larger random sample cuts variability, not bias.', facts: () => [['mean of p̂', f3(SC.m)], ['SD', f3(SC.s)]] },
  biasParam: { text: 'The parameter the samples are trying to hit.', facts: () => [['p', `${M.P}`]] },
  units: { text: `The experimental units: ${M.EXP.n} volunteers. Each is assigned a treatment at random and measured.`, facts: () => [['subjects', `${M.EXP.n}`], ['caffeine', `${M.EXP.n / 2}`], ['placebo', `${M.EXP.n / 2}`]] },
  groups: { text: 'The two treatment groups, formed by a random shuffle. The placebo group is the control group.', facts: () => [['treatments', 'caffeine, placebo'], ['units in each', `${M.EXP.n / 2}`]] },
  responses: { text: 'The response variable, reaction time, for each volunteer, by group; the lines are the group means.', facts: () => [['caffeine mean', `${f1(M.MCAF)} ms`], ['placebo mean', `${f1(M.MPLA)} ms`], ['difference', `${f1(M.DIFF)} ms`]] },
  blocks: { text: 'Volunteers first sorted by coffee habit (dark: regular drinkers), then split at random within each block: left caffeine, right placebo.', facts: () => [['coffee drinkers', `${BL_D / 2} + ${BL_D / 2}`], ['non-drinkers', `${BL_N / 2} + ${BL_N / 2}`]] },
  subjects: { text: 'Each column is one volunteer, tested twice. Red: caffeine, blue: placebo. A coin flip set the order.', facts: () => [['caffeine first', `${CAF_FIRST}`], ['placebo first', `${M.PAIRS.n - CAF_FIRST}`]] },
  pdiffs: { text: 'Placebo time minus caffeine time for each volunteer. Mostly positive: faster with caffeine.', facts: () => [['mean difference', `${f1(M.PD_MEAN)} ms`], ['SD', `${f1(M.PD_SD)} ms`]] },
  shuffle: { text: 'The 24 reaction times, unchanged, dealt again at random into two groups of 12 (red and blue). The lines are the two groups’ means.', facts: s => { const st = M.randAt(M.clk(s, 'rand')); return [['reshuffle', st.held ? 'as assigned' : `${Math.min(st.k, M.RAND.R - 1) + 1}`]]; } },
  randDist: { text: 'The differences in means that chance alone made, one dot per reshuffle. Centred near 0.', facts: () => [['reshuffles', `${M.RAND.R}`], ['range', `${f1(R_LO)} to ${f1(R_HI)} ms`], ['as large as observed', `${M.AS_BIG}`]] },
  observed: { text: 'The difference the experiment actually found. Beyond almost everything chance alone produced: statistically significant.', facts: () => [['observed', `${f1(M.DIFF)} ms`]] },
  ...Object.fromEntries(M.SCOPE.map(c => [c.key, { text: scopeText[c.key], facts: () => [['generalize to population', c.sel ? 'yes' : 'no'], ['cause and effect', c.asg ? 'yes' : 'no']] }])),
};
