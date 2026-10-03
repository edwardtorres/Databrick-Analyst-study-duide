import { test } from 'node:test'
import assert from 'node:assert/strict'
import ch4 from '../src/data/ch4/index.js'
import ch9 from '../src/data/ch9/index.js'

const chapters = { 4: ch4, 9: ch9 }

for (const [num, ch] of Object.entries(chapters)) {
  const qIds = new Set(ch.questions.map((q) => q.id))
  const cIds = new Set(ch.challenges.map((c) => c.id))
  const subIds = new Set(ch.subsections.map((s) => s.id))

  test(`ch${num}: question ids unique, one correct answer, every option explained`, () => {
    assert.equal(qIds.size, ch.questions.length)
    for (const q of ch.questions) {
      assert.equal(q.options.filter((o) => o.ok).length, 1, q.id)
      assert.ok(q.options.length >= 3, q.id)
      for (const o of q.options) assert.ok(o.why && o.why.length > 10, `${q.id}: missing why`)
      assert.ok(subIds.has(q.sub), `${q.id}: unknown sub ${q.sub}`)
    }
  })

  test(`ch${num}: blocks reference real content; every question is used`, () => {
    const used = new Set()
    for (const s of ch.subsections)
      for (const b of s.blocks) {
        if (b.type === 'quiz') b.ids.forEach((id) => (assert.ok(qIds.has(id), id), used.add(id)))
        if (b.type === 'challenge') assert.ok(cIds.has(b.id), b.id)
      }
    for (const id of qIds) assert.ok(used.has(id), `question ${id} not placed in any subsection`)
  })
}

test('question ids are unique across all chapters', () => {
  const ids = Object.values(chapters).flatMap((c) => c.questions.map((q) => q.id))
  assert.equal(new Set(ids).size, ids.length)
})
