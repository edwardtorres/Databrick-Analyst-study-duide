// Star Schema Builder lab (Chapter 8). Business process: retail sales.
// 1) pick the grain, 2) tap each column into the fact or a dimension,
// 3) spot the snowflake opportunity. Every choice is explained.

export const PROCESS = 'Retail sales: a customer buys one or more products in a store. The business wants revenue and units by product, customer, store, region and calendar.'

export const GRAINS = [
  { id: 'line', text: 'One row per order line (one product in one order)', ok: true, why: 'The most detailed grain the source supports. Every question (by product, customer, store, day) can be answered by aggregating up from it.' },
  { id: 'order', text: 'One row per order', why: 'Too coarse: an order with three products can\'t record each product and its quantity in one row.' },
  { id: 'store-day', text: 'One row per store per day', why: 'That is an aggregate (a periodic snapshot). Build it in gold from the line-level fact. As the base grain it loses customer and product detail.' },
  { id: 'product', text: 'One row per product', why: 'That describes products: it is the product dimension, not a fact.' },
]

export const TABLES = {
  fact_sales: { label: 'fact_sales', emoji: '📊' },
  dim_customer: { label: 'dim_customer', emoji: '🧑' },
  dim_product: { label: 'dim_product', emoji: '📦' },
  dim_date: { label: 'dim_date', emoji: '📅' },
  dim_store: { label: 'dim_store', emoji: '🏬' },
}

// Foreign keys are pre-placed in the fact so the exercise is about attributes vs measures.
export const FIXED_FACT_KEYS = ['customer_key', 'product_key', 'date_key', 'store_key']

export const COLUMNS = [
  { id: 'quantity', answer: 'fact_sales', why: 'A numeric measure of the event. Additive: it sums across every dimension.' },
  { id: 'net_amount', answer: 'fact_sales', why: 'The main additive measure. Measures live in the fact.' },
  { id: 'discount_amount', answer: 'fact_sales', why: 'Also a measure of the sale, so it belongs in the fact.' },
  { id: 'order_id', answer: 'fact_sales', why: 'A degenerate dimension: an identifier with no attributes of its own stays in the fact, so you can group lines into orders.' },
  { id: 'customer_name', answer: 'dim_customer', why: 'Describes the customer. Descriptive text lives in dimensions.' },
  { id: 'loyalty_tier', answer: 'dim_customer', why: 'A customer attribute used for slicing and filtering.' },
  { id: 'product_name', answer: 'dim_product', why: 'Describes the product.' },
  { id: 'category', answer: 'dim_product', why: 'A product attribute (part of the product hierarchy).' },
  { id: 'brand', answer: 'dim_product', why: 'A product attribute.' },
  { id: 'calendar_month', answer: 'dim_date', why: 'Calendar attributes live in a date dimension, so every fact can slice by month, quarter or holiday without date math.' },
  { id: 'is_holiday', answer: 'dim_date', why: 'A property of the day, not of the sale.' },
  { id: 'store_city', answer: 'dim_store', why: 'Describes where the store is.' },
  { id: 'region_name', answer: 'dim_store', why: 'In a star, region attributes are flattened into the store dimension (repeated for each store in the region).' },
  { id: 'region_manager', answer: 'dim_store', why: 'Another region attribute flattened into dim_store. It repeats for every store in the region.' },
]

export const SNOWFLAKE = [
  { id: 'region', text: 'Move region_name and region_manager out of dim_store into dim_region', ok: true, why: 'They repeat for every store in a region. Normalizing them (store → region) is snowflaking: less redundancy, one more join. Many BI teams keep the flat star for simpler, faster queries.' },
  { id: 'measures', text: 'Move quantity and net_amount into their own table', why: 'Measures belong in the fact. Splitting them out breaks the model.' },
  { id: 'holiday', text: 'Move is_holiday into fact_sales', why: 'It describes the date, not the sale. Putting it in the fact denormalizes the wrong way.' },
  { id: 'name', text: 'Put customer_name in its own table', why: 'A one-to-one attribute of the customer. Splitting it adds a join and removes no redundancy.' },
]

export const emptyStar = () => ({ grain: null, place: {}, snow: null })

export function sanitizeStar(saved) {
  const base = emptyStar()
  if (!saved || typeof saved !== 'object') return base
  const place = {}
  if (saved.place && typeof saved.place === 'object')
    for (const [col, t] of Object.entries(saved.place)) if (COLUMNS.some((c) => c.id === col) && TABLES[t]) place[col] = t
  return {
    grain: GRAINS.some((g) => g.id === saved.grain) ? saved.grain : null,
    place,
    snow: SNOWFLAKE.some((o) => o.id === saved.snow) ? saved.snow : null,
  }
}

export function starStatus(s) {
  const correctCols = COLUMNS.filter((c) => s.place[c.id] === c.answer).length
  return {
    grain: GRAINS.find((g) => g.id === s.grain)?.ok === true,
    columns: correctCols === COLUMNS.length,
    correctCols,
    placedCols: Object.keys(s.place).length,
    snowflake: SNOWFLAKE.find((o) => o.id === s.snow)?.ok === true,
  }
}
