// The chapter, page by page: text on the left, and for the figure on the right the camera, the one lit thing and
// what is shown. Every number comes from model.js.
import * as M from './model.js';
import { ST } from './world.js';
import { tex } from '../engine/tex.js';

const f = (x, n = 1) => (x < -1e-12 ? '−' : '') + Math.abs(x).toFixed(n);
const pc = (x, n = 0) => `${(100 * x).toFixed(n)}%`;
const F = M.FIVE, H = M.HEIGHT, S1 = M.STUDENTS[M.ONE];
const nine = M.NINE, nineS = [...nine].sort((a, b) => a - b), nOut = M.NINE_OUT, top = nine[M.NINE_TOP];
const tbl = (head, rows) => `<table class="data"><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;
const busF = M.BUS5, carF = M.CAR5;
const below2 = M.MEAN - 2 * M.SD;
const within = k => M.TIMES.filter(v => Math.abs(v - M.MEAN) <= k * M.SD).length / M.N;
const PEAK = M.BINS.reduce((a, b) => b.n > a.n ? b : a);
const zEx = M.zOf(M.Z_EX.x), zB = M.zOf(M.CALC.below), zA = M.zOf(M.CALC.between[0]), zP = M.normInv(M.CALC.pct);

export const PAGES = [
  {
    kicker: 'Chapter 1', title: 'Exploring one-variable data', sub: 'shape, centre and spread',
    body: `
      <p class="lede">Statistics is the science of learning from data, and data vary.</p>
      <p>${M.N} students in one class answered two questions: how do you get to school, and how many minutes does it take? In the figure each ball is one student, dropping onto the number line at their commute time.</p>
      <p>No two mornings are alike. The times run from ${F.min} to ${F.max} minutes, about three quarters of them ${F.q3} or less. That pattern, which values occur and how often, is the <b>distribution</b> of the variable.</p>
      <p>Beneath the dots, a <b>histogram</b> counts the same times in ${M.BIN.w}-minute bins, and below it a <b>cumulative graph</b> adds them up.</p>
      <p>This chapter names the kinds of variables, draws them in tables and graphs, describes a distribution by its <b>shape</b>, <b>centre</b> and <b>spread</b>, measures each with a number, and ends with the most useful model of all: the <b>normal distribution</b>.</p>`,
    cam: { target: [ST.drop, 1.5, 0], az: 0, el: 4, dist: 37 }, lit: 'dots', look: {}, scene: 'drop',
    fig: 'Forty commutes',
  },
  {
    kicker: '1.1', title: 'Introducing statistics', sub: 'what can we learn from data?',
    body: `
      <p class="lede">Data are information about <b>individuals</b>; a <b>variable</b> is a characteristic that changes from one individual to the next.</p>
      <p>Here the individuals are the ${M.N} students. The red ball is student ${M.ONE + 1}: travels by ${S1.mode}, ${S1.time} minutes. One student is one row of the data set; each variable is a column.</p>
      ${tbl(['student', 'mode', 'time (min)'], M.STUDENTS.slice(0, 5).map((s, i) => [i + 1, s.mode, s.time]))}
      <p>A <b>statistical question</b> expects variability in its answer. “How long does student ${M.ONE + 1} take to get to school?” has one answer. “How long do students in this class take to get to school?” has ${M.N}, and asks about their distribution.</p>
      <p>Variation is everywhere, so a pattern in data may be real or may be chance. Statistics separates the two. The questions it asks are always the same: who was measured, what was measured, how, and what can be concluded about whom.</p>
      <p>These ${M.N} answers describe this class. Conclusions about all students at the school would need a random sample of them (Chapter 3).</p>`,
    cam: { target: [ST.drop + 0.3, 1.8, 0], az: -4, el: 7, dist: 35 }, lit: 'student', look: {}, scene: 'drop',
    fig: 'One student, one row',
  },
  {
    kicker: '1.2', title: 'The language of variation', sub: 'categorical and quantitative variables',
    body: `
      <p class="lede">A <b>categorical</b> variable puts each individual into a group. A <b>quantitative</b> variable gives each individual a number that can be counted or measured.</p>
      <p>How a student travels (walk, bike, bus, car) is categorical. Commute time in minutes is quantitative: arithmetic on it makes sense, and its values sit on a number scale.</p>
      <p>In the figure the same ${M.N} balls move between the two views. On the number line each sits at its time; sorted by mode they fall into four groups. The individuals do not change, only the variable we look at.</p>
      <p>Quantitative variables are <b>discrete</b> (counts that can be listed: the number of siblings) or <b>continuous</b> (measurements on an interval: a time, a height).</p>
      <p><b>Careful.</b> Numbers are not always quantitative. A zip code or a jersey number labels a group; its average means nothing, so it is categorical. A quantitative variable can be made categorical by grouping: “more than 20 minutes, yes or no.”</p>`,
    cam: { target: [ST.cat - 4.6, 1.5, 0], az: 0, el: 5, dist: 52 }, lit: 'students', look: {}, scene: 'cat',
    fig: 'Two variables, one class',
  },
  {
    kicker: '1.3', title: 'Representing a categorical variable with tables', sub: 'frequency and relative frequency',
    body: `
      <p class="lede">A <b>frequency table</b> lists each category with its count. A <b>relative frequency table</b> gives each count as a proportion of the total.</p>
      <div class="eq">${tex(String.raw`\text{relative frequency} = \frac{\text{frequency}}{\text{total}}`)}</div>
      ${tbl(['mode', 'frequency', 'relative frequency', 'percent'], [...M.MODES.map(m => [m, M.COUNT[m], M.REL[m].toFixed(3), pc(M.REL[m], 1)]), ['total', M.N, '1.000', '100.0%']])}
      <p>The relative frequencies add to 1 (or 100%), apart from rounding. They let groups of different sizes be compared: a class of 25 and a school of 2000 can each be ${pc(M.REL.bus)} bus riders.</p>
      <p><b>In context.</b> ${M.COUNT.bus} of the ${M.N} students, a proportion of ${M.COUNT.bus}/${M.N} = ${M.REL.bus.toFixed(3)}, ride the bus: the most common way this class gets to school.</p>
      <p>The most common category is the <b>mode</b> of a categorical variable. A table of two categorical variables together, a two-way table, comes in Chapter 2.</p>`,
    cam: { target: [ST.cat + 5.4, 1.2, 0], az: 0, el: 4, dist: 34 }, lit: 'table', look: {}, scene: 'cat',
    fig: 'Counting by category',
  },
  {
    kicker: '1.4', title: 'Representing a categorical variable with graphs', sub: 'bar charts and pie charts',
    body: `
      <p class="lede">A <b>bar chart</b> draws each category as a bar whose height is its frequency or relative frequency. A <b>pie chart</b> gives each a wedge of a circle in proportion.</p>
      <p>Bars in a bar chart stand apart, since the categories have no scale between them, and their order is a choice. Ordering them by height makes the largest easy to see.</p>
      <p>A pie wedge’s angle is its relative frequency × 360°: the bus wedge is ${M.REL.bus.toFixed(3)} × 360° = ${(M.REL.bus * 360).toFixed(0)}°. A pie chart only works when the categories make one whole and every individual is in exactly one.</p>
      <p><b>Describing a categorical distribution.</b> Name the most and least frequent categories, and compare with proportions, in context: “${pc(M.REL.bus)} of students ride the bus, more than any other mode; ${pc(M.REL.walk, 1)} walk.”</p>
      <p><b>Misleading graphs.</b> A bar chart whose vertical axis does not start at zero exaggerates differences. Pictures and 3D pies that change area and depth as well as height do too. Read the scale before the shape.</p>`,
    cam: { target: [ST.cat + 18.6, 0.9, 0], az: 0, el: 4, dist: 37 }, lit: 'pie', look: {}, scene: 'cat',
    fig: 'Bars and wedges',
  },
  {
    kicker: '1.5', title: 'Representing a quantitative variable with graphs', sub: 'dotplots, stemplots, histograms and cumulative graphs',
    body: `
      <p class="lede">A graph of a quantitative variable shows its distribution on a number line: where the values are, and how they bunch and spread.</p>
      <p>A <b>dotplot</b> puts one dot per individual above its value. A <b>stemplot</b> splits each value into a stem (here the tens) and a leaf (the ones):</p>
      <table class="data">${M.STEMS.map(s => `<tr><th>${s.stem}</th><td style="text-align:left">${s.leaves.join(' ') || '&nbsp;'}</td></tr>`).join('')}</table>
      <p>Key: 1 | 4 means 14 minutes. Both keep every value.</p>
      <p>A <b>histogram</b> counts the values in equal intervals, or bins, here ${M.BIN.w} minutes wide; the bars touch, because the scale is continuous. A time of exactly 15 goes in the bin 15 to 20. A different bin width can change the picture, so choose one that shows the shape without hiding detail.</p>
      <p>A <b>cumulative graph</b> plots, at the end of each bin, the proportion of values below it. It reads percentiles: ${pc(M.pctAt(M.PCT.t))} of the class took less than ${M.PCT.t} minutes, and the graph crosses 0.5 at the median, about ${M.OGIVE_MED} minutes.</p>`,
    cam: { target: [ST.drop, -3.4, 0], az: 0, el: 4, dist: 50 }, lit: 'hist', look: {}, scene: 'drop',
    fig: 'Four ways to draw it',
  },
  {
    kicker: '1.6', title: 'Describing the distribution of a quantitative variable', sub: 'shape, centre, spread and unusual features',
    body: `
      <p class="lede">Describe a distribution by its <b>shape</b>, <b>centre</b>, <b>spread</b> and any <b>unusual features</b>, always in the context of the data.</p>
      <p><b>Shape.</b> <b>Symmetric</b>: the two sides roughly mirror each other. <b>Skewed right</b>: a long tail toward larger values. <b>Skewed left</b>: a long tail toward smaller values. A skew is named for its tail, not its peak. Count the peaks too: <b>unimodal</b>, <b>bimodal</b> (two clusters, often two groups mixed), or <b>uniform</b> (no clear peak).</p>
      <p><b>Unusual features.</b> <b>Gaps</b> (stretches with no values), <b>clusters</b>, and <b>outliers</b>: values far from the rest.</p>
      <p><b>The class, described.</b> The distribution of commute times is unimodal and skewed right, peaking at ${PEAK.a} to ${PEAK.b} minutes. The median is about ${F.med} minutes, and times range from ${F.min} to ${F.max} minutes. There is a gap from ${M.WHISK.hi} to ${F.max} minutes, and ${F.max} minutes is a possible outlier.</p>
      <p>The words “about” and “roughly” belong here: shape is judged by eye. 1.7 and 1.8 put numbers on centre and spread and give a rule for outliers.</p>`,
    cam: { target: [ST.shapes - 0.2, -0.6, 0], az: 0, el: 4, dist: 44 }, lit: 'right', look: {}, scene: 'shapes',
    fig: 'Four shapes',
  },
  {
    kicker: '1.7', title: 'Summary statistics: centre', sub: 'mean, median, and which one resists',
    body: `
      <p class="lede">The <b>mean</b> is the sum of the values divided by how many there are. The <b>median</b> is the middle value once they are in order.</p>
      <div class="eq">${tex(String.raw`\bar{x} = \frac{\sum x_i}{n}`)}</div>
      <p>Nine of the class, in order: ${nineS.join(', ')}. The mean is ${nineS.reduce((a, b) => a + b)}/${nine.length} = ${M.NINE_MEAN.toFixed(1)} minutes. The median is the 5th of the 9 values, ${M.NINE_MED} minutes. With an even count, the median is the mean of the middle two.</p>
      <p><b>The mean is the balance point.</b> Put the values on a beam: it balances at <i>x̄</i> (red), where the distances on either side cancel. The median (blue) only counts: half the values on each side.</p>
      <p><b>Resistance.</b> In the figure, the ${top}-minute commute slides out to ${top + M.SLIDE.by}. The mean follows it, to ${M.mean(nOut).toFixed(1)} minutes; the median stays at ${M.median(nOut)}. The median is <b>resistant</b> to extreme values; the mean is not.</p>
      <p>So in a distribution skewed right the mean is pulled toward the tail, above the median: for the whole class <i>x̄</i> = ${M.MEAN.toFixed(1)} and the median is ${F.med}. Skewed left, the mean is below the median. For a skewed distribution or one with outliers, report the median.</p>`,
    cam: { target: [ST.centre + 0.2, 0.6, 0], az: 0, el: 6, dist: 35 }, lit: 'fulcrum', look: {}, scene: 'centre',
    fig: 'The balance point',
  },
  {
    kicker: '1.7', title: 'Summary statistics: spread', sub: 'range, IQR and standard deviation',
    body: `
      <p class="lede">The <b>standard deviation</b> measures the typical distance of the values from their mean.</p>
      <div class="eq">${tex(String.raw`s = \sqrt{\frac{\sum (x_i - \bar{x})^2}{n - 1}}`)}</div>
      ${tbl(['<i>x</i>', '<i>x</i> − <i>x̄</i>', '(<i>x</i> − <i>x̄</i>)²'], nine.map((v, i) => [v, f(M.DEV[i], 2), (M.DEV[i] ** 2).toFixed(2)]))}
      <p>The deviations (red) add to zero; their squares add to ${M.SS.toFixed(2)}. Divide by <i>n</i> − 1 = ${nine.length - 1} for the <b>variance</b>, <i>s</i>² = ${(M.SS / (nine.length - 1)).toFixed(2)}, and take the square root: <i>s</i> = ${M.NINE_SD.toFixed(2)} minutes.</p>
      <p><b>Interpret it in context:</b> these nine commute times typically vary by about ${M.NINE_SD.toFixed(1)} minutes from their mean of ${M.NINE_MEAN.toFixed(1)} minutes. <i>s</i> is 0 only when every value is the same, and like the mean it is not resistant.</p>
      <p>The <b>range</b> is max − min. The <b>quartiles</b> Q<sub>1</sub> and Q<sub>3</sub> are the medians of the lower and upper halves (the median itself left out when <i>n</i> is odd); the <b>interquartile range</b>, IQR = Q<sub>3</sub> − Q<sub>1</sub>, is the spread of the middle half, and resistant. The <i>p</i>th <b>percentile</b> is the value with <i>p</i>% of the data below it.</p>
      <p>For the whole class: range ${M.RANGE}, IQR ${F.q3} − ${F.q1} = ${M.IQR}, <i>s</i> = ${M.SD.toFixed(1)} minutes.</p>`,
    cam: { target: [ST.spread + 0.6, 0.5, 0], az: 0, el: 4, dist: 39 }, lit: 'devs', look: {}, scene: 'spread',
    fig: 'Deviations from the mean',
  },
  {
    kicker: '1.7', title: 'Changing units', sub: 'adding and multiplying every value',
    body: `
      <p class="lede">Adding a constant to every value shifts the centre and leaves the spread. Multiplying every value by a constant multiplies both.</p>
      <p>Ten daily highs in °C, converted to °F by <i>F</i> = 1.8<i>C</i> + 32. The figure does it in two steps: every value × 1.8 (the dots spread apart), then + 32 (they move along together).</p>
      ${tbl(['', 'mean', 'median', 'SD', 'IQR'], [['°C', M.C_MEAN.toFixed(1), M.median(M.CELS), M.C_SD.toFixed(2), M.C_IQR], ['°F', M.F_MEAN.toFixed(2), M.median(M.FAHR).toFixed(1), M.F_SD.toFixed(2), (1.8 * M.C_IQR).toFixed(1)]])}
      <div class="eq">${tex(String.raw`\begin{aligned}\bar{x}_F &= 1.8\,\bar{x}_C + 32 = 1.8(${M.C_MEAN.toFixed(1)}) + 32 = ${M.F_MEAN.toFixed(2)} \\ s_F &= 1.8\,s_C = 1.8(${M.C_SD.toFixed(3)}) = ${M.F_SD.toFixed(2)}\end{aligned}`)}</div>
      <p>For <i>y</i> = <i>a</i> + <i>bx</i> (<i>b</i> > 0): measures of centre and position (mean, median, quartiles, percentiles) become <i>a</i> + <i>b</i> × the old value. Measures of spread (range, IQR, SD) are multiplied by <i>b</i> and ignore <i>a</i>. The variance is multiplied by <i>b</i>². The shape does not change.</p>
      <p><b>The common mistake:</b> adding 32 to the standard deviation. Shifting every value moves them all together; the distances between them, and from their mean, stay the same.</p>`,
    cam: { target: [ST.units + 0.2, 0.9, 0], az: 0, el: 4, dist: 37 }, lit: 'convert', look: {}, scene: 'units',
    fig: '°C to °F',
  },
  {
    kicker: '1.8', title: 'Graphical representations of summary statistics', sub: 'the boxplot and the 1.5 × IQR rule',
    body: `
      <p class="lede">A <b>boxplot</b> draws the five-number summary: a box from Q<sub>1</sub> to Q<sub>3</sub>, a line at the median, and whiskers out to the smallest and largest values that are not outliers.</p>
      ${tbl(['min', 'Q<sub>1</sub>', 'median', 'Q<sub>3</sub>', 'max'], [[F.min, F.q1, F.med, F.q3, F.max]])}
      <p><b>The 1.5 × IQR rule.</b> A value is an <b>outlier</b> if it lies more than 1.5 × IQR below Q<sub>1</sub> or above Q<sub>3</sub>:</p>
      <div class="eq">${tex(String.raw`\begin{aligned}\text{IQR} &= ${F.q3} - ${F.q1} = ${M.IQR} \\ Q_1 - 1.5\,\text{IQR} &= ${F.q1} - ${1.5 * M.IQR} = ${f(M.FENCE.lo)} \\ Q_3 + 1.5\,\text{IQR} &= ${F.q3} + ${1.5 * M.IQR} = ${f(M.FENCE.hi)}\end{aligned}`)}</div>
      <p>No time is below ${f(M.FENCE.lo)}; ${M.OUTLIERS.join(', ')} is above ${f(M.FENCE.hi)}, so it is an outlier, drawn on its own. The right whisker stops at ${M.WHISK.hi}, the largest time that is not. Another rule some use: more than 2 standard deviations from the mean, here above ${(M.MEAN + 2 * M.SD).toFixed(1)}.</p>
      <p>A boxplot shows skew: here the right whisker is longer and the median sits nearer Q<sub>1</sub>, so the times are skewed right. It hides the rest: the gap, the number of peaks, and <i>n</i>. Each quarter of the data, not each quarter of the length, holds about a quarter of the values.</p>`,
    cam: { target: [ST.box + 0.2, 0.1, 0], az: 0, el: 4, dist: 37 }, lit: 'boxplot', look: {}, scene: 'box',
    fig: 'Five numbers and a fence',
  },
  {
    kicker: '1.9', title: 'Comparing distributions of a quantitative variable', sub: 'shape, centre, spread and outliers, side by side',
    body: `
      <p class="lede">To compare distributions, draw them on one scale and compare shape, centre, spread and unusual features, in context and in comparative words.</p>
      ${tbl(['', '<i>n</i>', 'min', 'Q<sub>1</sub>', 'median', 'Q<sub>3</sub>', 'max', 'IQR'], [['bus', M.BUS.length, busF.min, busF.q1, busF.med, busF.q3, busF.max, busF.q3 - busF.q1], ['car', M.CAR.length, carF.min, carF.q1, carF.med, carF.q3, carF.max, carF.q3 - carF.q1]])}
      <p><b>Shape.</b> Bus commutes are roughly symmetric. Car commutes are skewed right, with an outlier at ${M.CAR_OUT.join(', ')} minutes (above Q<sub>3</sub> + 1.5 × IQR = ${M.CARF.hi}).</p>
      <p><b>Centre.</b> The median bus commute, ${busF.med} minutes, is ${busF.med - carF.med} minutes longer than the median car commute, ${carF.med} minutes.</p>
      <p><b>Spread.</b> Car commutes vary more: an IQR of ${carF.q3 - carF.q1} minutes against ${busF.q3 - busF.q1}, and a range of ${carF.max - carF.min} against ${busF.max - busF.min}.</p>
      <p>Compare medians and IQRs when a distribution is skewed or has outliers. Lists of numbers are not a comparison: say which is greater. Graphs for comparing: side-by-side dotplots, parallel boxplots, back-to-back stemplots, and histograms stacked on the same scale.</p>`,
    cam: { target: [ST.compare + 0.2, 0, 0], az: 0, el: 4, dist: 38 }, lit: 'medians', look: {}, scene: 'compare',
    fig: 'Bus against car',
  },
  {
    kicker: '1.10', title: 'The normal distribution', sub: 'the empirical rule and z-scores',
    body: `
      <p class="lede">A <b>normal distribution</b> is symmetric, single-peaked and bell-shaped. It is fixed by its mean μ and standard deviation σ, written N(μ, σ).</p>
      <p>The heights of adult women are close to N(${H.mu}, ${H.sigma}) in cm. The histogram is ${H.n} of them, drawn so its area is 1, with the normal curve over it. μ and σ describe a model or population; <i>x̄</i> and <i>s</i> describe data (here ${M.H_MEAN.toFixed(1)} and ${M.H_SD.toFixed(1)} cm).</p>
      <p><b>The empirical rule.</b> In any normal distribution about 68% of values lie within 1σ of μ, 95% within 2σ and 99.7% within 3σ.</p>
      ${tbl(['within', '1 SD', '2 SD', '3 SD'], [['normal model', '68%', '95%', '99.7%'], [`the ${H.n} heights`, ...M.WITHIN.map(w => pc(w, 1))]])}
      <p><b>z-scores.</b> A <b>standardized score</b> says how many standard deviations a value is from the mean, and in which direction:</p>
      <div class="eq">${tex(String.raw`z = \frac{x - \mu}{\sigma} = \frac{${M.Z_EX.x} - ${H.mu}}{${H.sigma}} = ${zEx.toFixed(2)}`)}</div>
      <p>A woman ${M.Z_EX.x} cm tall is ${zEx.toFixed(2)} standard deviations above the mean height. z-scores compare values on different scales; standardizing gives a distribution with mean 0 and SD 1, the <b>standard normal</b>.</p>`,
    cam: { target: [ST.normal, -0.1, 0], az: 0, el: 4, dist: 37 }, lit: 'band', look: {}, scene: 'normal',
    fig: '68, 95, 99.7',
  },
  {
    kicker: '1.10', title: 'Normal calculations', sub: 'areas, percentiles and the value at a percentile',
    body: `
      <p class="lede">In a normal model, the proportion of values in an interval is the area under the curve over it.</p>
      <p><b>Below a value.</b> What proportion of women are shorter than ${M.CALC.below} cm?</p>
      <div class="eq">${tex(String.raw`\begin{aligned}z &= \frac{${M.CALC.below} - ${H.mu}}{${H.sigma}} = ${zB.toFixed(2)} \\ P(X < ${M.CALC.below}) &= P(Z < ${zB.toFixed(2)}) \\ &= ${M.P_BELOW.toFixed(3)}\end{aligned}`)}</div>
      <p>About ${pc(M.P_BELOW, 1)} of women are shorter than ${M.CALC.below} cm: ${M.CALC.below} cm is at about the ${Math.round(100 * M.P_BELOW)}th percentile. Above it is 1 − ${M.P_BELOW.toFixed(3)} = ${(1 - M.P_BELOW).toFixed(3)}.</p>
      <p><b>Between two values.</b> P(${M.CALC.between[0]} < X < ${M.CALC.between[1]}) = P(${zA.toFixed(2)} < Z < ${zB.toFixed(2)}) = ${M.P_BETWEEN.toFixed(3)}.</p>
      <p><b>A value from a percentile.</b> The ${Math.round(M.CALC.pct * 100)}th percentile has area ${M.CALC.pct.toFixed(2)} to its left, at <i>z</i> = ${zP.toFixed(3)}:</p>
      <div class="eq">${tex(String.raw`\begin{aligned}x &= \mu + z\sigma \\ &= ${H.mu} + ${zP.toFixed(3)}(${H.sigma}) = ${M.X_PCT.toFixed(1)}\ \text{cm}\end{aligned}`)}</div>
      <p>Show the work as the exam asks: name the distribution and its parameters, mark the boundary and the area wanted (a sketch), give the z-score or the calculator command with its inputs labelled (normalcdf: lower ${M.CALC.between[0]}, upper ${M.CALC.between[1]}, μ = ${H.mu}, σ = ${H.sigma}), and answer in context.</p>`,
    cam: { target: [ST.ncalc, -0.1, 0], az: 0, el: 4, dist: 37 }, lit: 'area', look: {}, scene: 'ncalc',
    fig: 'Area is proportion',
  },
  {
    kicker: '1.10', title: 'Is a normal model reasonable?', sub: 'checking data for normality',
    body: `
      <p class="lede">Before using a normal model for data, check that the data look normal. Many real distributions are not.</p>
      <p><b>Graph the data.</b> A normal model needs a dotplot or histogram that is roughly symmetric and single-peaked, with no outliers.</p>
      <p><b>Check the empirical rule.</b> Count the values within 1, 2 and 3 standard deviations of the mean. The heights give ${M.WITHIN.map(w => pc(w, 1)).join(', ')}, close to 68, 95, 99.7.</p>
      <p><b>Look at a normal probability plot.</b> Each value is plotted against the z-score it would have if the data were exactly normal. Normal data fall close to a straight line, as the heights do. Skewed data bend: the commute times curve upward at the right, the long right tail.</p>
      <p>The empirical rule alone can mislead. ${pc(within(1), 1)} of commute times lie within one SD of the mean, close to 68%. But <i>x̄</i> − 2<i>s</i> = ${M.MEAN.toFixed(1)} − 2(${M.SD.toFixed(1)}) = ${f(below2)} minutes, an impossible time: a normal model would put about ${pc(M.normCdf(-2), 1)} of commutes below it. When the mean is less than two SDs above a floor of 0, suspect skew to the right.</p>`,
    cam: { target: [ST.check, 0.3, 0], az: 0, el: 4, dist: 37 }, lit: 'npTimes', look: {}, scene: 'check',
    fig: 'Straight, or bent?',
  },
];

// ---------- click a thing: what it is, with its live numbers ----------
const dropN = s => M.landed(M.dropT(M.clk(s, 'drop')));
const sh = k => M.SHAPES.find(x => x.key === k);
const shapeFacts = k => () => { const x = sh(k); return [['mean', x.mean.toFixed(1)], ['median', `${x.median}`], ['n', `${x.data.length}`]]; };
export const PLATES = {
  dots: { text: `A dotplot: one dot per student, stacked where values repeat. Every value is kept, so nothing is lost; it works best for small data sets.`,
    facts: s => [['landed', `${dropN(s)} of ${M.N}`], ['mean', `${M.MEAN.toFixed(1)} min`], ['median', `${F.med} min`]] },
  student: { text: `One individual: a row of the data set. This student’s answers are one value of each variable.`, facts: () => [['student', `${M.ONE + 1}`], ['mode', S1.mode], ['time', `${S1.time} min`]] },
  hist: { text: `A histogram: the times counted in ${M.BIN.w}-minute bins. The bar’s height is the count; the bars touch, because time is continuous. Skewed right, with a gap and one long commute.`,
    facts: () => M.BINS.filter(b => b.n).map(b => [`${b.a}–${b.b} min`, `${b.n}`]) },
  ogive: { text: 'The cumulative relative frequency: at each bin’s right end, the proportion of students below it. Where it crosses 0.5 is the median; any height is a percentile.',
    facts: () => [['median, read at 0.5', `${M.OGIVE_MED} min`], [`below ${M.PCT.t} min`, pc(M.pctAt(M.PCT.t))]] },
  students: { text: 'The same 40 students, coloured by how they travel. On the number line they show time (quantitative); sorted into columns they show mode (categorical).',
    facts: () => M.MODES.map(m => [m, `${M.COUNT[m]}`]) },
  table: { text: 'A frequency table: the count in each category, and that count as a proportion of all 40.', facts: () => M.MODES.map(m => [m, `${M.COUNT[m]} · ${M.REL[m].toFixed(3)}`]) },
  barchart: { text: 'A bar chart of relative frequencies. The bars stand apart: the categories have no scale between them.', facts: () => M.MODES.map(m => [m, M.REL[m].toFixed(3)]) },
  pie: { text: 'A pie chart: each wedge’s angle is its relative frequency × 360°. Only for parts of one whole.', facts: () => M.MODES.map(m => [m, `${(M.REL[m] * 360).toFixed(0)}°`]) },
  sym: { text: 'Roughly symmetric: heights of women. The left and right halves nearly mirror each other, so the mean and median are close.', facts: shapeFacts('sym') },
  right: { text: 'Skewed right: the class’s commute times. Most are short; a long tail runs to the right, with a gap and an outlier. The mean is pulled toward the tail.', facts: shapeFacts('right') },
  left: { text: 'Skewed left: scores on an easy quiz. Most are high; a tail runs toward low scores, and the mean sits below the median.', facts: shapeFacts('left') },
  bi: { text: 'Bimodal: the time between eruptions of a geyser. Two peaks, often a sign of two kinds of individuals mixed together (short and long eruptions).', facts: shapeFacts('bi') },
  nine: { text: 'Nine commute times on a beam. The red one slides out and back; the rest stay put.', facts: s => { const x = M.nineAt(M.clk(s, 'centre')); return [['moving value', `${Math.round(x[M.NINE_TOP])} min`], ['sum', `${x.reduce((a, b) => a + b).toFixed(0)}`]]; } },
  fulcrum: { text: 'The mean is where the beam balances. One far value moves it a long way: the mean is not resistant.', facts: s => [['x̄', `${M.mean(M.nineAt(M.clk(s, 'centre'))).toFixed(2)} min`]] },
  median: { text: 'The median: the middle of the nine in order. Moving the largest value does not move it: resistant.', facts: () => [['median', `${M.NINE_MED} min`], ['values below / above', '4 / 4']] },
  values: { text: 'The nine values, one to a row, and their mean (the black line).', facts: () => [['x̄', `${M.NINE_MEAN.toFixed(2)} min`], ['n', `${nine.length}`]] },
  devs: { text: 'Each deviation x − x̄. Negatives and positives cancel exactly, so the deviations are squared before they are averaged (over n − 1).',
    facts: () => [['sum of deviations', '0'], ['sum of squares', M.SS.toFixed(2)], ['s', `${M.NINE_SD.toFixed(2)} min`]] },
  sdbar: { text: 'One standard deviation either side of the mean: a typical distance of a value from the mean.', facts: () => [['x̄ − s', `${(M.NINE_MEAN - M.NINE_SD).toFixed(1)}`], ['x̄ + s', `${(M.NINE_MEAN + M.NINE_SD).toFixed(1)}`]] },
  celsius: { text: 'Ten daily highs as recorded, in °C.', facts: () => [['mean', `${M.C_MEAN.toFixed(1)} °C`], ['SD', `${M.C_SD.toFixed(2)} °C`]] },
  convert: { text: 'The same ten days on their way to °F: first every value × 1.8, then + 32.', facts: s => { const U = M.unitsAt(M.clk(s, 'units')); return [['× now', U.k.toFixed(2)], ['+ now', U.a.toFixed(1)]]; } },
  meanSd: { text: 'The mean (line) and one SD either side (bar). Multiplying stretches both; adding moves the mean and leaves the SD.', facts: s => { const U = M.unitsAt(M.clk(s, 'units')); return [['mean', M.mean(U.vals).toFixed(2)], ['SD', M.sd(U.vals).toFixed(2)]]; } },
  dots5: { text: 'The commute times of the class, under their boxplot.', facts: () => [['n', `${M.N}`]] },
  outlier: { text: `${M.OUTLIERS.join(', ')} minutes: more than 1.5 × IQR above Q3. It is plotted on its own, and the whisker stops short of it.`, facts: () => [['upper fence', `${M.FENCE.hi}`], ['value', `${M.OUTLIERS.join(', ')}`]] },
  boxplot: { text: 'The five-number summary drawn: each section holds about a quarter of the students. A longer right whisker and a median near Q1: skewed right.', facts: () => [['min', `${F.min}`], ['Q1', `${F.q1}`], ['median', `${F.med}`], ['Q3', `${F.q3}`], ['max', `${F.max}`]] },
  fences: { text: 'The fences, 1.5 × IQR beyond the quartiles. Only the upper one is on the scale; the lower is below zero.', facts: () => [['lower fence', f(M.FENCE.lo)], ['upper fence', f(M.FENCE.hi)]] },
  bus: { text: 'Bus riders’ commutes: roughly symmetric, no outliers.', facts: () => [['median', `${busF.med}`], ['IQR', `${busF.q3 - busF.q1}`], ['mean', M.mean(M.BUS).toFixed(1)]] },
  car: { text: 'Car riders’ commutes: skewed right, with one outlier.', facts: () => [['median', `${carF.med}`], ['IQR', `${carF.q3 - carF.q1}`], ['mean', M.mean(M.CAR).toFixed(1)]] },
  medians: { text: 'The two medians, on one scale: the comparison of centres, in minutes.', facts: () => [['bus', `${busF.med}`], ['car', `${carF.med}`], ['difference', `${busF.med - carF.med}`]] },
  heights: { text: `${H.n} women’s heights, scaled so the bars’ total area is 1, to sit under a density curve.`, facts: () => [['x̄', `${M.H_MEAN.toFixed(1)} cm`], ['s', `${M.H_SD.toFixed(1)} cm`]] },
  curve: { text: `The normal density N(${H.mu}, ${H.sigma}): symmetric about μ, its inflection points at μ ± σ, total area 1.`, facts: () => [['μ', `${H.mu} cm`], ['σ', `${H.sigma} cm`]] },
  band: { text: 'The area within k standard deviations of the mean: the same in every normal distribution.', facts: s => { const k = M.bandK(M.clk(s, 'normal')); return [['k', `${k}`], ['area', M.RULE[k - 1].toFixed(4)], ['heights within', pc(M.WITHIN[k - 1], 1)]]; } },
  curve2: { text: `The same model, N(${H.mu}, ${H.sigma}).`, facts: () => [['μ', `${H.mu}`], ['σ', `${H.sigma}`]] },
  area: { text: 'The area to the left of x: the proportion of women shorter than x, and x’s percentile.', facts: s => { const x = M.calcX(M.clk(s, 'ncalc')); return [['x', `${x.toFixed(1)} cm`], ['z', f(M.zOf(x), 2)], ['area', M.normCdf(x, H.mu, H.sigma).toFixed(3)]]; } },
  npHeights: { text: 'Heights against their expected z-scores: close to a straight line, so a normal model is reasonable.', facts: () => [['within 1, 2, 3 SD', M.WITHIN.map(w => pc(w, 1)).join(', ')]] },
  npTimes: { text: 'Commute times against their expected z-scores: the points bend upward at the right. Skewed right; not normal.', facts: () => [['x̄ − 2s', `${f(below2)} min`], ['shortest time', `${F.min} min`]] },
};
