import { Link } from 'react-router-dom';

export default function About() {
  return (
    <>
      <section className="container" style={{ paddingTop: 60, paddingBottom: 96 }}>
        <span className="eyebrow">Tentang Sahabat Cake</span>
        <h1 className="h-page">Teman manis, di setiap cerita.</h1>
        <p className="lead">Usaha tart dan kue basah yang ingin hadir dekat dengan momen Anda—dari perayaan istimewa hingga suguhan sehari-hari.</p>
        <div className="split" style={{ '--cols': '1.5fr 1fr', marginTop: 52 }}>
          <img src="/uploads/about.jpg" alt="Tart bunga biru di dekat jendela" style={{ aspectRatio: '623 / 415' }} />
          <div>
            <span className="eyebrow">Kenal lebih dekat</span>
            <h2 className="h-sec">Bukan hanya kue.<br />Tentang kebersamaan.</h2>
            <p style={{ margin: '24px 0 18px', lineHeight: 1.8 }}>SAHABAT CAKE menghadirkan pilihan kue tart dan kue basah untuk melengkapi meja perayaan Anda. Tart memberi ruang untuk sentuhan personal, sementara kue basah membawa rasa yang akrab untuk dibagikan.</p>
            <p style={{ lineHeight: 1.8 }}>Kami menjaga cara memilih dan memesan tetap mudah: katalog yang jelas, detail pesanan yang rapi, dan percakapan langsung melalui WhatsApp.</p>
          </div>
        </div>
      </section>

      <section className="section white"><div className="container split" style={{ '--cols': '1fr 1.6fr', alignItems: 'start' }}>
        <div><span className="eyebrow">Cerita kami</span><h2 className="h-sec">Berawal dari makna berbagi.</h2></div>
        <div>
          <p className="h-sec" style={{ fontFamily: 'var(--serif)', fontSize: 30, lineHeight: 1.25 }}>Ada hal sederhana yang membuat sebuah momen dikenang: duduk bersama, bercerita, dan berbagi rasa.</p>
          <p style={{ margin: '22px 0', lineHeight: 1.8 }}>Semangat itulah yang menjadi arah cerita SAHABAT CAKE. Kami ingin menyatukan tart untuk perayaan dan kue basah untuk keseharian dalam satu rumah rasa yang hangat. Setiap pesanan adalah awal percakapan tentang kebutuhan dan momen Anda.</p>
          <p className="small" style={{ borderTop: '1px solid var(--line)', paddingTop: 18 }}>Narasi profil untuk konsep. Riwayat usaha dan tahun berdiri akan dilengkapi oleh pemilik; belum ada klaim penghargaan atau pencapaian.</p>
        </div>
      </div></section>

      <section className="section"><div className="container split" style={{ '--cols': '1fr 1.4fr', alignItems: 'start' }}>
        <div><span className="eyebrow">Visi</span><h2 className="h-sec">Menjadi sahabat untuk setiap momen manis yang layak dibagikan.</h2></div>
        <div className="list-rows">
          <span className="eyebrow">Misi</span>
          <div><span className="n">01</span><div><h3>Rasa yang dekat</h3><p>Menghadirkan tart dan kue basah yang mengundang kebersamaan.</p></div></div>
          <div><span className="n">02</span><div><h3>Pilihan yang personal</h3><p>Membantu pelanggan mengeksplorasi desain custom khusus tart.</p></div></div>
          <div><span className="n">03</span><div><h3>Proses yang jelas</h3><p>Menjaga informasi katalog dan komunikasi pesanan tetap sederhana.</p></div></div>
        </div>
      </div></section>

      <section style={{ paddingBottom: 96 }}><div className="container split" style={{ '--cols': '1fr 1.4fr' }}>
        <div>
          <span className="eyebrow">Di balik setiap potong</span>
          <h2 className="h-sec">Detail kecil, dikerjakan sepenuh hati.</h2>
          <p style={{ margin: '24px 0 28px', lineHeight: 1.8 }}>Dari merapikan lapisan krim hingga menata suguhan, perhatian pada detail memberi karakter pada kue. Lihat ragam hasil dan inspirasi di galeri kami.</p>
          <Link to="/galeri-kontak" className="btn btn-line btn-sm">Lihat galeri <span>↗</span></Link>
        </div>
        <img src="/uploads/detail.jpg" alt="Menghias tart dengan bunga" style={{ aspectRatio: '672 / 440' }} />
      </div></section>

      <section className="mint"><div className="container cta-band">
        <h2 className="h-sec" style={{ fontSize: 40 }}>Mari jadi bagian dari cerita Anda.</h2>
        <Link to="/katalog-tart" className="btn btn-solid">Temukan kue favorit <span>↗</span></Link>
      </div></section>
    </>
  );
}
