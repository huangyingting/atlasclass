// The chapter, page by page: text on the left, and for the figure on the right the camera, the one lit thing and
// what is shown. Every number comes from model.js.
import * as M from './model.js';
import { ST } from './world.js';
import { tex } from '../engine/tex.js';

const f = (x, n = 2) => (x < -1e-12 ? '−' : '') + Math.abs(x).toFixed(n);
const pc = (x, n = 0) => `${(100 * x).toFixed(n)}%`;
const F = M.FEMUR, L = M.LS, C = M.CAT;
const A1 = L.a.toFixed(1), B2 = L.b.toFixed(2), R2 = L.r.toFixed(2), R3 = L.r.toFixed(3);
// the femur data, in two rows of seven pairs
const half = F.n / 2;
const femurTable = [0, half].map(o => `<table class="data"><tr><th>femur (cm)</th>${F.x.slice(o, o + half).map(v => `<td>${v.toFixed(1)}</td>`).join('')}</tr><tr><th>height (cm)</th>${F.y.slice(o, o + half).map(v => `<td>${v.toFixed(1)}</td>`).join('')}</tr></table>`).join('');
// the two-way table, with its totals
const twoWay = `<table class="data"><tr><th></th>${C.cols.map(c => `<th>${c}</th>`).join('')}<th>total</th></tr>
  ${C.rows.map((r, i) => `<tr><th>${r}</th>${C.n[i].map(v => `<td>${v}</td>`).join('')}<td>${M.ROWT[i]}</td></tr>`).join('')}
  <tr><th>total</th>${M.COLT.map(v => `<td>${v}</td>`).join('')}<td>${M.TOT}</td></tr></table>`;
const condTable = `<table class="data"><tr><th></th>${C.cols.map(c => `<th>${c}</th>`).join('')}</tr>
  ${C.rows.map((r, i) => `<tr><th>${r}</th>${M.COND[i].map(v => `<td>${pc(v)}</td>`).join('')}</tr>`).join('')}
  <tr><th>all</th>${M.MARG.map(v => `<td>${pc(v)}</td>`).join('')}</tr></table>`;
const K = M.KINDS, XF = M.XFITS, XK = M.XP.keys;
const PRED = M.yhat(M.PRED.x), FAR = M.yhat(M.PRED.far);
const RX = F.x[M.RMAX], RY = F.y[M.RMAX], RYH = M.yhat(RX);
const LG = M.FIT_LOG, LA = LG.a.toFixed(3), LB = LG.b.toFixed(4);

export const PAGES = [
  {
    kicker: 'Chapter 2', title: 'Exploring two-variable data', sub: 'scatterplots and the least-squares line',
    body: `
      <p class="lede">Two things measured on each individual: does one tell you about the other, and how much?</p>
      <p>Forensic scientists estimate a person’s height from a single bone. The figure plots femur (thigh bone) length against height for ${F.n} adults. Taller people have longer femurs, and the points lie close to a straight line.</p>
      <p>Which line? A line tried through the points misses each one by a <b>residual</b>, red. Square each residual (the red squares) and add up their areas. As the trial line turns, the total area changes; the <b>least-squares line</b> is the one that makes it smallest: here <i>ŷ</i> = ${A1} + ${B2}<i>x</i>, with total area ${M.SSE.toFixed(0)} cm².</p>
      <p>The chapter starts with categorical variables (two-way tables, bar graphs, conditional percentages), then describes scatterplots, measures linear association with the <b>correlation</b> <i>r</i>, fits and checks the least-squares line, and asks what a single unusual point, or a curve, does to it.</p>`,
    cam: { target: [ST.fit - 0.2, 0.3, 0], az: -4, el: 4, dist: 54 }, lit: 'squares', look: {}, scene: 'fit',
    fig: 'The line of least squares',
  },
  {
    kicker: '2.1', title: 'Are the variables related?', sub: 'a pattern, or chance?',
    body: `
      <p class="lede">Two variables are <b>associated</b> when knowing the value of one tells you something about the value of the other.</p>
      <p>Statistics starts with a question about variation. Do adults with longer femurs tend to be taller? Does how a student gets to school depend on where they live? Each question pairs two variables measured on the same individuals.</p>
      <p>Data always vary, so some pattern can appear by chance alone. The figure tests that. On the left are the real pairs, <i>r</i> = ${R2}. On the right the same ${F.n} heights are shuffled among the same ${F.n} femurs, at random, again and again. Shuffling breaks any real link, so whatever pattern is left is chance.</p>
      <p>Below, the correlation of each of ${M.SHUF.k} shuffles. They scatter around 0, and the farthest is ${f(M.SHUF_R[M.SHUF_R.map(Math.abs).indexOf(M.SHUF_MAX)])}. The real ${R2} is beyond all of them: chance alone is not a believable explanation for a pattern this strong.</p>
      <p>That is the reasoning of the whole course in miniature: ask what chance alone would produce, and see whether the data look like it. Later units make it exact.</p>`,
    cam: { target: [ST.shuffle + 0.1, 0, 0], az: -3, el: 3, dist: 50 }, lit: 'shuffled', look: {}, scene: 'shuffle',
    fig: 'The real pairs, and shuffled ones',
  },
  {
    kicker: '2.2', title: 'Two categorical variables', sub: 'two-way tables and bar graphs',
    body: `
      <p class="lede">A <b>two-way table</b> counts the individuals in each combination of two categorical variables.</p>
      <p>${M.TOT} students were asked where they live and how they usually get to school:</p>
      ${twoWay}
      <p>The totals at the edges are the <b>marginal</b> counts: each variable on its own. ${M.COLT[2]} of the ${M.TOT} students come by car, whatever the place.</p>
      <p><b>Side-by-side bars</b> (left) draw the counts. They are easy to read but hard to compare when the groups differ in size: there are ${M.ROWT[1]} suburban students but only ${M.ROWT[2]} rural ones, so counts mislead.</p>
      <p><b>Segmented bars</b> (right) fix that: each group is one bar of height 100%, cut into the shares of its own students. Rural students come by car ${pc(M.COND[2][2])} of the time, city students ${pc(M.COND[0][2])}. A <b>mosaic plot</b> (2.3) also makes each bar’s width match its group’s size.</p>
      <p>Choose which variable splits the bars by the question. To compare how places travel, make a bar per place.</p>`,
    cam: { target: [ST.table - 7.6, 1.8, 0], az: -8, el: 8, dist: 48 }, lit: 'sideby', look: {}, scene: 'table',
    fig: 'Counts, and shares',
  },
  {
    kicker: '2.3', title: 'Joint, marginal and conditional', sub: 'three kinds of relative frequency',
    body: `
      <p class="lede">A relative frequency divides a count by a total. Which total you divide by decides what it means.</p>
      <ul>
        <li><b>Joint</b>: one cell over the table total. ${C.n[2][2]} of ${M.TOT} students are rural and come by car: ${C.n[2][2]}/${M.TOT} = ${pc(M.JOINT[2][2], 1)}.</li>
        <li><b>Marginal</b>: a row or column total over the table total. ${M.COLT[2]}/${M.TOT} = ${pc(M.MARG[2])} of all students come by car.</li>
        <li><b>Conditional</b>: a cell over its own row or column total. Of rural students, ${C.n[2][2]}/${M.ROWT[2]} = ${pc(M.COND[2][2])} come by car. Of the car riders, ${C.n[2][2]}/${M.COLT[2]} = ${pc(M.COLCOND[2][2], 1)} are rural.</li>
      </ul>
      <p>The last two differ: ‘of rural students, the share by car’ and ‘of car riders, the share rural’ divide by different totals. Read the wording for the group named after <i>of</i>, or after <i>given</i>: that total is the denominator.</p>
      <p>The <b>mosaic plot</b> shows all three at once. Each column’s width is its place’s marginal share; each block’s height is a conditional share within the place; so each block’s area is a joint share. The rural car block is ${pc(M.JOINT[2][2], 1)} of the whole mosaic.</p>`,
    cam: { target: [ST.table + 2.6, 1.8, 0], az: 6, el: 8, dist: 46 }, lit: 'mosaic', look: {}, scene: 'table',
    fig: 'Area is a joint share',
  },
  {
    kicker: '2.3', title: 'Association between categorical variables', sub: 'compare the conditional distributions',
    body: `
      <p class="lede">Two categorical variables are associated when the conditional distribution of one differs across the categories of the other.</p>
      <p>The conditional distributions of travel, for each place, and for all students together:</p>
      ${condTable}
      <p>If travel did not depend on place, every row would match the ‘all’ row, and the segmented bars would be cut at the same heights. They are not: the car share climbs from ${pc(M.COND[0][2])} in the city to ${pc(M.COND[1][2])} in the suburbs and ${pc(M.COND[2][2])} in the country, while walking or biking falls from ${pc(M.COND[0][0])} to ${pc(M.COND[2][0])}. There is an association between where a student lives and how they get to school.</p>
      <p>Compare <b>percentages</b>, not counts. ${C.n[1][2]} suburban car riders outnumber ${C.n[2][2]} rural ones, yet a smaller share of suburban students come by car.</p>
      <p>An association in data is not proof of cause. Living in the country need not itself cause the driving: distance to school, a variable not in the table, may explain much of it. Chapter 8 tests whether such a difference could be chance (the χ² test).</p>`,
    cam: { target: [ST.table - 3.1, 1.8, 0], az: -3, el: 6, dist: 34 }, lit: 'segmented', look: {}, scene: 'table',
    fig: 'Are the bars cut alike?',
  },
  {
    kicker: '2.4', title: 'Scatterplots', sub: 'direction, form, strength and unusual features',
    body: `
      <p class="lede">A <b>scatterplot</b> shows two quantitative variables measured on the same individuals, one point per individual.</p>
      <p>The <b>explanatory</b> variable goes on the <i>x</i>-axis: the one that may explain or predict. The <b>response</b> variable goes on the <i>y</i>-axis: the outcome. Here femur length explains height.</p>
      ${femurTable}
      <p>Describe a scatterplot by four features, in context:</p>
      <ul>
        <li><b>Direction</b>: positive (larger <i>x</i> goes with larger <i>y</i>), negative, or neither.</li>
        <li><b>Form</b>: linear, or curved, or clusters.</li>
        <li><b>Strength</b>: how closely the points follow the form: strong, moderate or weak.</li>
        <li><b>Unusual features</b>: outliers, gaps, clusters.</li>
      </ul>
      <p>Here: there is a strong, positive, linear association between femur length and height for these adults, with no clear outliers. The small plots show other patterns: a weaker negative one, a strong curve, and none.</p>`,
    cam: { target: [ST.kinds - 3.5, 0.3, 0], az: -3, el: 3, dist: 62 }, lit: 'femur', look: {}, scene: 'kinds',
    fig: 'Four features to describe',
  },
  {
    kicker: '2.5', title: 'Correlation', sub: 'the strength of a linear association, as a number',
    body: `
      <p class="lede">The <b>correlation</b> <i>r</i> measures the direction and strength of a linear association between two quantitative variables.</p>
      <div class="eq">${tex(String.raw`r = \frac{1}{n-1}\sum \left(\frac{x_i-\bar x}{s_x}\right)\left(\frac{y_i-\bar y}{s_y}\right)`)}</div>
      <p>Standardise each variable: <i>z<sub>x</sub></i> and <i>z<sub>y</sub></i> say how many standard deviations a value lies from its mean. Lines at the means cut the plot into four quadrants. A point up and right (or down and left) has a positive product <i>z<sub>x</sub>z<sub>y</sub></i>, a red rectangle; up and left or down and right, a negative one, blue.</p>
      <p>Add the signed areas and divide by <i>n</i> − 1. For the femurs, ${F.n} products sum to ${M.PROD_SUM.toFixed(3)}, and ${M.PROD_SUM.toFixed(3)}/${F.n - 1} = ${R3}. Nearly all the area is red: a strong positive association.</p>
      <p><i>r</i> lies between −1 and 1. Its sign is the direction; its size is the strength: near ±1 the points lie close to a line, near 0 there is no <i>linear</i> pattern. Interpret it in context: <i>r</i> = ${R2} says there is a strong, positive, linear association between femur length and height.</p>
      <p>On the exam, find <i>r</i> with a calculator; know what it means.</p>`,
    cam: { target: [ST.corr - 2.4, 0, 0], az: -3, el: 3, dist: 42 }, lit: 'products', look: {}, scene: 'corr',
    fig: 'Adding up the products',
  },
  {
    kicker: '2.5', title: 'What r does not say', sub: 'only linear, sensitive to outliers, not causation',
    body: `
      <p class="lede"><i>r</i> is a summary of a straight-line pattern. Always look at the scatterplot first.</p>
      <ul>
        <li><b>Linear only.</b> The red plot has a strong curved relationship, yet <i>r</i> = ${f(K.curved.r)}. <i>r</i> near 0 means no <i>linear</i> association, not no association. A high <i>r</i> doesn’t prove a line is the right form either.</li>
        <li><b>No units.</b> <i>r</i> stays the same if either variable changes units: with femurs in inches, <i>r</i> is still ${M.R_IN.toFixed(3)}. Swapping <i>x</i> and <i>y</i> doesn’t change it.</li>
        <li><b>Not resistant.</b> Like the mean, <i>r</i> can be moved a lot by one outlying point (2.9).</li>
        <li><b>Not causation.</b> A strong correlation doesn’t mean that changing <i>x</i> changes <i>y</i>. A <b>lurking variable</b> may drive both (ice-cream sales and drownings both rise in summer heat), or the link may run the other way. Only a well-designed experiment (Chapter 3) shows cause.</li>
      </ul>
      <p>The four small plots: ${K.pos.name}, <i>r</i> = ${f(K.pos.r)}; ${K.neg.name}, <i>r</i> = ${f(K.neg.r)}; ${K.curved.name}, <i>r</i> = ${f(K.curved.r)}; ${K.none.name}, <i>r</i> = ${f(K.none.r)}.</p>`,
    cam: { target: [ST.kinds + 1.8, 0.1, 0], az: 0, el: 3, dist: 37 }, lit: 'curved', look: {}, scene: 'kinds',
    fig: 'Strong, yet r near 0',
  },
  {
    kicker: '2.6', title: 'Linear regression models', sub: 'a line for predicting y from x',
    body: `
      <p class="lede">A <b>regression line</b> models how a response <i>y</i> changes with an explanatory <i>x</i>, and predicts <i>y</i> for a given <i>x</i>.</p>
      <div class="eq">${tex(String.raw`\hat y = a + bx = ${A1} + ${B2}\,x`)}</div>
      <p><i>ŷ</i> (y-hat) is a <b>predicted</b> value, not an observed one: write the hat. <i>b</i> is the slope and <i>a</i> the <i>y</i>-intercept. Write the model in context: predicted height = ${A1} + ${B2} (femur length).</p>
      <p><b>Predicting.</b> For a femur of ${M.PRED.x.toFixed(1)} cm, <i>ŷ</i> = ${A1} + ${B2}(${M.PRED.x.toFixed(1)}) = ${PRED.toFixed(1)} cm. That is the average height the model gives for adults with that femur length; any one of them may be taller or shorter.</p>
      <p><b>Extrapolation</b> is predicting outside the range of <i>x</i> in the data, here ${M.XR[0].toFixed(1)} to ${M.XR[1].toFixed(1)} cm. The line has no evidence there: the form may change. A child’s ${M.PRED.far.toFixed(0)} cm femur gives <i>ŷ</i> = ${FAR.toFixed(1)} cm, from a model built on adults only. In the figure the dot turns grey whenever it leaves the data’s range.</p>`,
    cam: { target: [ST.line, 0.1, 0], az: -3, el: 3, dist: 40 }, lit: 'predict', look: {}, scene: 'line',
    fig: 'Up to the line, across to ŷ',
  },
  {
    kicker: '2.7', title: 'Residuals', sub: 'what the line misses, and the residual plot',
    body: `
      <p class="lede">A <b>residual</b> is an observed value minus its predicted value: how far the point lies above or below the line.</p>
      <div class="eq">${tex(String.raw`\text{residual} = y - \hat y`)}</div>
      <p>The adult with femur ${RX.toFixed(1)} cm is ${RY.toFixed(1)} cm tall. The line predicts ${RYH.toFixed(1)} cm, so the residual is ${RY.toFixed(1)} − ${RYH.toFixed(1)} = ${f(RY - RYH, 1)} cm: ${f(RY - RYH, 1)} cm taller than predicted. A negative residual means the line overestimated. For the least-squares line, the residuals add to 0.</p>
      <p>A <b>residual plot</b> graphs each residual against <i>x</i> (or against <i>ŷ</i>). In the figure each residual drops from the scatterplot to the plot below: the line laid flat at 0.</p>
      <ul>
        <li><b>No pattern</b>, an even scatter about 0: a linear model is appropriate. That is what the femurs show.</li>
        <li><b>A curve</b> in the residuals: the relationship is not linear; another form would fit better (2.9).</li>
        <li><b>A fan</b>, spread growing with <i>x</i>: predictions are less precise for larger <i>x</i>.</li>
      </ul>
      <p>A residual plot shows the leftover pattern more clearly than the scatterplot, because the line’s trend has been taken away.</p>`,
    cam: { target: [ST.resid, 0.5, 0], az: -3, el: 3, dist: 44 }, lit: 'residplot', look: {}, scene: 'resid',
    fig: 'The line laid flat',
  },
  {
    kicker: '2.8', title: 'Least-squares regression', sub: 'the line that makes the squared residuals smallest',
    body: `
      <p class="lede">The <b>least-squares regression line</b> is the line that makes the sum of the squared residuals as small as possible.</p>
      <p>On the right, the sum of squared residuals for each slope (each line through the mean point): a parabola, lowest at <i>b</i> = ${B2}. Any other slope gives a larger total.</p>
      <div class="eq">${tex(String.raw`b = r\,\frac{s_y}{s_x} = ${R3}\cdot\frac{${L.sy.toFixed(3)}}{${L.sx.toFixed(3)}} = ${L.b.toFixed(3)} \qquad a = \bar y - b\bar x = ${L.my.toFixed(2)} - ${L.b.toFixed(3)}(${L.mx.toFixed(2)}) = ${L.a.toFixed(1)}`)}</div>
      <p>So the line always passes through (<i>x̄</i>, <i>ȳ</i>) = (${L.mx.toFixed(2)}, ${L.my.toFixed(2)}), and its slope has the sign of <i>r</i>. An increase of one standard deviation in <i>x</i> predicts an increase of <i>r</i> standard deviations in <i>y</i>: less than one, the ‘regression to the mean’.</p>
      <p><b>Interpreting.</b> Slope: for each additional 1 cm of femur length, the predicted height increases by about ${B2} cm. Intercept: an adult with a femur of 0 cm would have predicted height ${A1} cm; that is extrapolation and has no meaning here, as often for an intercept.</p>
      <p>Regressing <i>x</i> on <i>y</i> gives a different line. Predict the response from the explanatory variable, not the other way.</p>`,
    cam: { target: [ST.fit + 0.4, 0.2, 0], az: 4, el: 4, dist: 52 }, lit: 'sse', look: {}, scene: 'fit',
    fig: 'Smallest at the least-squares slope',
  },
  {
    kicker: '2.8', title: 'r² and s', sub: 'how well the line fits, and how far off it typically is',
    body: `
      <p class="lede">Two numbers say how good the line’s predictions are: the <b>coefficient of determination</b> <i>r</i><sup>2</sup> and the <b>standard deviation of the residuals</b> <i>s</i>.</p>
      <p>Software prints the line like this:</p>
      <table class="data"><tr><th>Predictor</th><th>Coef</th><th>SE Coef</th></tr><tr><td>Constant</td><td>${L.a.toFixed(3)}</td><td>${M.SE_A.toFixed(3)}</td></tr><tr><td>Femur</td><td>${L.b.toFixed(4)}</td><td>${L.seB.toFixed(4)}</td></tr></table>
      <p class="data">S = ${L.s.toFixed(4)} &ensp; R-sq = ${pc(L.r2, 1)}</p>
      <p>Read <i>a</i> beside Constant and <i>b</i> beside the explanatory variable: <i>ŷ</i> = ${A1} + ${B2}<i>x</i>. (SE Coef is for Chapter 9.)</p>
      <p><b><i>r</i><sup>2</sup></b> = ${pc(L.r2, 1)}: without the line, the squared deviations of the heights from <i>ȳ</i> total ${M.SST.toFixed(0)} cm²; about the line, ${M.SSE.toFixed(0)}. The line removes 1 − ${M.SSE.toFixed(0)}/${M.SST.toFixed(0)} = ${pc(L.r2, 1)} of it. In context: about ${pc(L.r2, 1)} of the variation in height is accounted for by the linear model with femur length.</p>
      <p><b><i>s</i></b> = ${L.s.toFixed(2)} cm, from the residuals (divide by <i>n</i> − 2):</p>
      <div class="eq">${tex(String.raw`s = \sqrt{\frac{\sum (y_i - \hat y_i)^2}{n-2}} = \sqrt{\frac{${M.SSE.toFixed(1)}}{${F.n - 2}}} = ${L.s.toFixed(2)}\ \text{cm}`)}</div>
      <p>In context: actual heights typically differ from the heights the line predicts by about ${L.s.toFixed(1)} cm. The blue band is <i>ŷ</i> ± <i>s</i>.</p>`,
    cam: { target: [ST.line, 0.1, 0], az: 3, el: 3, dist: 40 }, lit: 'band', look: {}, scene: 'line',
    fig: 'Typically within s of the line',
  },
  {
    kicker: '2.9', title: 'Outliers, leverage and influence', sub: 'what one point can do to the line',
    body: `
      <p class="lede">One unusual point can change a regression a great deal, or hardly at all. Where it lies decides which.</p>
      <ul>
        <li>An <b>outlier</b> in regression is a point with a large residual: far above or below the line.</li>
        <li>A <b>high-leverage</b> point has an <i>x</i>-value far from <i>x̄</i>. It has the power to tilt the line.</li>
        <li>An <b>influential</b> point is one whose removal changes the slope, intercept or correlation markedly. High-leverage points often are.</li>
      </ul>
      <p>The red point is added to the ${F.n} adults and moved. The grey line is without it:</p>
      <table class="data"><tr><th>the 15th point</th><th><i>b</i></th><th><i>a</i></th><th><i>r</i></th></tr>
        <tr><td>none</td><td>${L.b.toFixed(2)}</td><td>${L.a.toFixed(1)}</td><td>${R3}</td></tr>
        ${XK.map((k, i) => `<tr><td>(${k.x}, ${k.y.toFixed(1)})</td><td>${XF[i].b.toFixed(2)}</td><td>${XF[i].a.toFixed(1)}</td><td>${XF[i].r.toFixed(3)}</td></tr>`).join('')}</table>
      <p>Far right and on the line: high leverage but not influential on the slope; it even raises <i>r</i>. Far right and below the line: it drags the slope from ${L.b.toFixed(2)} to ${XF[1].b.toFixed(2)}, influential. Near <i>x̄</i> and high above: an outlier that lowers <i>r</i> to ${XF[2].r.toFixed(3)} but barely moves the slope.</p>
      <p>Never just delete an unusual point. Check it for an error; if it is real, report the fit with and without it.</p>`,
    cam: { target: [ST.infl - 0.5, 0.2, 0], az: -3, el: 3, dist: 40 }, lit: 'mover', look: {}, scene: 'infl',
    fig: 'One point, moved',
  },
  {
    kicker: '2.9', title: 'Transforming to a line', sub: 'logarithms straighten exponential growth',
    body: `
      <p class="lede">When a scatterplot curves, transforming a variable can make it linear; then the least-squares line can model it.</p>
      <p>A culture of bacteria was counted every hour for ${M.BACT.t.length - 1} hours. The counts curve upward: each hour multiplies the count rather than adding to it. A line fits badly even though <i>r</i> = ${M.FIT_RAW.r.toFixed(3)}: its residual plot is a clear curve.</p>
      <p>Take logarithms of the counts. Exponential growth becomes linear: the figure moves between the two. Against <i>t</i>, log<sub>10</sub>(count) is straight, <i>r</i> = ${LG.r.toFixed(3)}, and its residuals show no pattern.</p>
      <div class="eq">${tex(String.raw`\widehat{\log_{10}(\text{count})} = ${LA} + ${LB}\,t`)}</div>
      <p><b>Predicting</b> needs the transformation undone. At <i>t</i> = ${M.LOGT.at} hours: log<sub>10</sub>(count) = ${LA} + ${LB}(${M.LOGT.at}) = ${(LG.a + LG.b * M.LOGT.at).toFixed(3)}, so count ≈ 10<sup>${(LG.a + LG.b * M.LOGT.at).toFixed(3)}</sup> = ${M.LOG_PRED.toFixed(0)}. The slope says the predicted count is multiplied by 10<sup>${LG.b.toFixed(4)}</sup> = ${M.GROWTH.toFixed(3)} each hour.</p>
      <p>Other curves need other transformations: log <i>y</i> against log <i>x</i> straightens a <b>power</b> model, <i>y</i> = <i>ax<sup>b</sup></i>; a square root or a reciprocal may straighten others. Choose the transformation whose residual plot shows no pattern.</p>`,
    cam: { target: [ST.logt, 0.6, 0], az: -3, el: 3, dist: 44 }, lit: 'bactres', look: {}, scene: 'logt',
    fig: 'From a curve to a line',
  },
];

// ---------- click a thing: what it is, with its live numbers ----------
const slope = s => M.fitSlope(M.clk(s, 'fit'));
const lineFacts = () => [['ŷ', `${A1} + ${B2}x`], ['r', R3], ['r²', L.r2.toFixed(3)], ['s', `${L.s.toFixed(2)} cm`]];
const at = s => M.xpAt(M.clk(s, 'infl'));
export const PLATES = {
  points: { text: `${F.n} adults: femur length on x, the explanatory variable; height on y, the response. A strong, positive, linear pattern.`, facts: () => [['n', `${F.n}`], ['x̄', `${L.mx.toFixed(2)} cm`], ['ȳ', `${L.my.toFixed(2)} cm`], ['r', R3]] },
  trial: { text: 'A trial line through the mean point (x̄, ȳ), turning. Every line through that point leaves residuals that add to 0; least squares chooses among them by the sum of their squares.', facts: s => [['slope now', f(slope(s), 3)], ['least-squares slope', L.b.toFixed(3)]] },
  squares: { text: 'Each red square has the residual as its side, so its area is the residual squared. Least squares makes the total area smallest. Squaring treats points above and below alike and penalises big misses most.', facts: s => [['total area now', `${M.sse(slope(s)).toFixed(1)} cm²`], ['least possible', `${M.SSE.toFixed(1)} cm²`]] },
  sse: { text: 'The sum of squared residuals for each slope of a line through (x̄, ȳ). It is a parabola; its lowest point is the least-squares slope, b = r·s_y/s_x.', facts: s => [['slope now', f(slope(s), 3)], ['sum now', `${M.sse(slope(s)).toFixed(1)} cm²`], ['minimum', `${M.SSE.toFixed(1)} cm² at b = ${L.b.toFixed(3)}`]] },
  real: { text: 'The real pairs: each adult’s femur with that adult’s height.', facts: () => [['r', R3]] },
  shuffled: { text: 'The same heights, given to the femurs in a random order. Any real link is broken, so what pattern remains is chance alone.', facts: s => { const a = M.shufAt(M.clk(s, 'shuffle')); return [['shuffle', `${a.k + 1} of ${M.SHUF.k}`], ['r of this shuffle', f(M.SHUF_R[a.k])]]; } },
  rdots: { text: 'The correlation of each shuffle, one dot each. Chance alone gives values scattered around 0; the real r, in red, lies beyond them all.', facts: () => [['shuffles', `${M.SHUF.k}`], ['largest |r| by chance', M.SHUF_MAX.toFixed(2)], ['real r', R3]] },
  sideby: { text: 'The counts in each place, one bar per way of travelling. Bars of different groups are hard to compare when the groups differ in size.', facts: () => C.rows.map((r, i) => [r, C.n[i].join(' · ')]) },
  segmented: { text: 'Each place as 100%, cut into the shares of its students who walk or bike (grey), take the bus (blue) and come by car (red); the last bar is all students. Cuts at different heights: an association.', facts: () => [...C.rows.map((r, i) => [`${r}, by car`, pc(M.COND[i][2])]), ['all, by car', pc(M.MARG[2])]] },
  mosaic: { text: 'Each column is as wide as its place’s share of all students; each block as tall as a conditional share within the place. So each block’s area is a joint share of all 300.', facts: () => [['rural (width)', pc(M.ROWT[2] / M.TOT, 1)], ['by car, of rural (height)', pc(M.COND[2][2], 1)], ['rural and car (area)', pc(M.JOINT[2][2], 1)]] },
  femur: { text: 'Femur length (explanatory) against height (response): a strong, positive, linear association with no clear outliers.', facts: () => [['n', `${F.n}`], ['r', R3]] },
  kpos: { text: 'Strong, positive and linear: the points lie close to a rising line.', facts: () => [['r', f(K.pos.r, 3)]] },
  kneg: { text: 'Moderate, negative and linear: the points fall from left to right, with a lot of scatter.', facts: () => [['r', f(K.neg.r, 3)]] },
  curved: { text: 'A strong curved relationship with r near 0. r measures only linear association: always look at the plot.', facts: () => [['r', f(K.curved.r, 3)]] },
  knone: { text: 'No association: knowing x tells nothing about y.', facts: () => [['r', f(K.none.r, 3)]] },
  zpoints: { text: 'Each adult in z-scores: (x − x̄)/s_x across, (y − ȳ)/s_y up. The axes are now the means.', facts: () => [['x̄', `${L.mx.toFixed(2)} cm`], ['s_x', `${L.sx.toFixed(3)} cm`], ['ȳ', `${L.my.toFixed(2)} cm`], ['s_y', `${L.sy.toFixed(3)} cm`]] },
  products: { text: 'For each point, the rectangle from (0, 0) to (z_x, z_y): its area is the product z_x·z_y, red when positive (top right, bottom left), blue when negative.', facts: s => { const n = Math.floor(M.corrN(M.clk(s, 'corr'))); return [['products added', `${n}`], ['their sum', f(M.partSum(n), 3)], ['all 14', M.PROD_SUM.toFixed(3)]]; } },
  rbar: { text: 'The products added so far, divided by n − 1. When all are in, the bar stands at r.', facts: s => { const n = Math.floor(M.corrN(M.clk(s, 'corr'))); return [['so far', f(M.partSum(n) / (F.n - 1), 3)], ['r', R3]]; } },
  lpoints: { text: 'The 14 adults, on a wider board: room to see where the data stop.', facts: () => [['femur range', `${M.XR[0].toFixed(1)} to ${M.XR[1].toFixed(1)} cm`]] },
  lsrl: { text: 'The least-squares line. Solid over the data’s x range; dashed beyond it, where predictions are extrapolation.', facts: lineFacts },
  band: { text: 'The line plus and minus s, the standard deviation of the residuals: a typical prediction misses by about s.', facts: () => [['s', `${L.s.toFixed(2)} cm`], ['r²', pc(L.r2, 1)]] },
  predict: { text: 'Up from x to the line and across: the predicted height ŷ. Grey when x is outside the data, where the prediction is extrapolation.', facts: s => { const x = M.predX(M.clk(s, 'line')); return [['x', `${x.toFixed(1)} cm`], ['ŷ', `${M.yhat(x).toFixed(1)} cm`], ['', M.inRange(x) ? 'within the data' : 'extrapolation']]; } },
  rpoints: { text: 'The data and the least-squares line. Each point’s residual is its vertical distance from the line, y − ŷ.', facts: lineFacts },
  rods: { text: 'Each residual as a red rod from ŷ up or down to y. The rods above the line and below it balance: the residuals add to 0.', facts: s => { const k = M.resAt(M.clk(s, 'resid')).k; return k < F.n ? [['x', `${F.x[k].toFixed(1)} cm`], ['y', `${F.y[k].toFixed(1)} cm`], ['ŷ', `${M.yhat(F.x[k]).toFixed(1)} cm`], ['residual', `${f(L.res[k], 1)} cm`]] : [['sum of residuals', f(Math.abs(L.res.reduce((a, b) => a + b, 0)) < 1e-9 ? 0 : L.res.reduce((a, b) => a + b, 0), 1)]]; } },
  residplot: { text: 'Each residual against x. An even, patternless scatter about 0: a linear model suits these data.', facts: () => [['largest', `${f(Math.max(...L.res), 1)} cm`], ['smallest', `${f(Math.min(...L.res), 1)} cm`], ['s', `${L.s.toFixed(2)} cm`]] },
  base: { text: 'The 14 adults, unchanged.', facts: () => [['b', L.b.toFixed(3)], ['r', R3]] },
  oldline: { text: 'The least-squares line of the 14 adults alone, for comparison.', facts: () => [['ŷ', `${A1} + ${B2}x`], ['r', R3]] },
  newline: { text: 'The least-squares line of all 15 points, refitted as the new point moves. How far it swings from the grey line measures the point’s influence.', facts: s => { const p = at(s), w = M.withPoint(p.x, p.y); return [['b', w.b.toFixed(3)], ['a', w.a.toFixed(1)], ['r', w.r.toFixed(3)]]; } },
  mover: { text: 'One extra point. Far right it has high leverage; below the line there it is influential; near x̄ and high it is an outlier with little pull on the slope.', facts: s => { const p = at(s), w = M.withPoint(p.x, p.y); return [['point', `(${p.x.toFixed(1)}, ${p.y.toFixed(1)})`], ['now', XK[p.key].kind], ['b with it', w.b.toFixed(3)], ['b without', L.b.toFixed(3)]]; } },
  bact: { text: 'The counts each hour: growth by a factor each hour, so the curve bends upward. Its logarithms lie on a line.', facts: () => [['hours', `0 to ${M.BACT.t.length - 1}`], ['first count', `${M.BACT.y[0]}`], ['last count', `${M.BACT.y.at(-1)}`]] },
  bactline: { text: 'The least-squares line fitted to whatever is plotted now: the counts, their logarithms, or a blend while the figure moves between them.', facts: s => { const w = M.bFit(M.logU(M.clk(s, 'logt'))); return [['r now', w.r.toFixed(3)], ['r, counts', M.FIT_RAW.r.toFixed(3)], ['r, log counts', LG.r.toFixed(3)]]; } },
  bactres: { text: 'The residuals of that line. For the counts, a U-shaped curve: a line is the wrong form. For the logarithms, no pattern.', facts: s => [['showing', M.logU(M.clk(s, 'logt')) < 0.5 ? 'count' : 'log₁₀(count)']] },
};
