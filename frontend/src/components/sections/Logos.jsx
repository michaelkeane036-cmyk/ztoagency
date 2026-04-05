export default function Logos() {
  const brands = ['StyleHaus','FinEdge','GreenBowl','RealtyPrime','LagosCakes','SwiftDelivery','BoltAfrica','NaijaFresh']

  return (
    <section id="logos" aria-label="Clients we have worked with">
      <div className="container">
        <p className="logos-label">Trusted by fast-growing Nigerian brands</p>
        <div className="logos-track" role="list">
          {brands.map(b => (
            <div key={b} className="logo-item" role="listitem">
              <span className="logo-name">{b}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
