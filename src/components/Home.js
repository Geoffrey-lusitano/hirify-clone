import React from 'react';
import { useRouter } from 'next/navigation';
import hirifyLogo from '../assets/hirify-logo.svg';

const Home = () => {
  const router = useRouter();

  const navigateTo = (path) => {
    router.push(path);
  };

  return (
    <>
      <style>{`
        .home-bg {
          min-height: 100vh;
          width: 100vw;
          background: linear-gradient(120deg, #e3f1f6 0%, #f6fbfd 50%, #11809C 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          overflow: hidden;
        }
        .navbar {
          width: 100vw;
          height: 100px;
          background: #fff;
          box-shadow: 0 2px 8px #11809c0e;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          box-sizing: border-box;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 10;
          min-width: 0;
        }
        .navbar-title {
          font-weight: 900;
          font-size: 3rem;
          color: #11809C;
          letter-spacing: 1px;
          font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
          white-space: nowrap;
          flex-shrink: 1;
          min-width: 0;
        }
        .navbar-btn {
          background: #11809C;
          color: #fff;
          border-radius: 8px;
          font-weight: 700;
          font-size: 20px;
          padding: 10px 25px;
          box-shadow: 0 1px 6px #11809c13;
          border: none;
          white-space: nowrap;
          flex-shrink: 0;
          cursor: pointer;
          transition: background 0.18s;
        }
        .navbar-btn:hover {
          background: #0c5d6f;
        }
        .navbar-spacer {
          height: 100px;
          width: 100%;
        }
        .hero-flex {
          width: 100vw;
          max-width: 1500px;
          margin: 0 auto;
          margin-top: 100px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 100px;
          padding: 48px 5vw 0;
          min-height: 420px;
        }
        .hero-text {
          flex: 1 1 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .hero-title {
          font-size: 3.2rem;
          font-weight: 900;
          color: #11809C;
          margin-bottom: 16px;
          letter-spacing: 1px;
          font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
        }
        .hero-slogan {
          font-size: 1.5rem;
          font-weight: 700;
          color: #222;
          margin-bottom: 24px;
        }
        .hero-slogan span {
          color: #11809C;
        }
        .hero-desc {
          color: #444;
          font-size: 1.16rem;
          margin-bottom: 32px;
          line-height: 1.6;
        }
        .main-btn {
          border-radius: 10px;
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          padding: 15px 42px;
          background: #fff;
          color: #11809C;
          border: 2px solid #11809C;
          box-shadow: 0 1px 6px #11809c13;
          transition: transform 0.12s, background 0.18s;
          cursor: pointer;
        }
        .main-btn:hover {
          background: #11809C;
          color: #fff;
        }
        .hero-logo {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 18px;
        }
        @media (max-width: 900px) {
          .hero-flex {
            flex-direction: column;
            align-items: flex-start;
            gap: 24px;
            padding: 38px 2vw 0 2vw;
            min-height: unset;
          }
          .hero-logo {
            margin-left: 0;
            margin-top: 16px;
          }
          .hero-title {
            font-size: 2.1rem;
          }
        }
        @media (max-width: 600px) {
          .navbar {
            height: 68px;
            padding: 0 10px;
          }
          .navbar-title {
            font-size: 1.6rem;
          }
          .navbar-spacer {
            height: 68px;
          }
          .hero-flex {
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
            padding: 22px 2vw 0 2vw;
          }
          .hero-title {
            font-size: 1.3rem;
          }
        }
        @media (max-width: 600px) {
          .navbar {
            height: 68px;
            padding: 0 10px;
          }
          .navbar-title {
            font-size: 1.6rem;
          }
          .navbar-spacer {
            height: 68px;
          }
          .main-card {
            padding: 24px 6vw 20px 6vw;
          }
        }
      `}</style>
      <div className="home-bg">
        {/* NAVBAR */}
        <nav className="navbar">
          <div className="navbar-title">Hirify</div>
          <button className="navbar-btn" onClick={() => router.push('/login')}>
            Connexion
          </button>
        </nav>
        {/* ESPACE POUR NAVBAR FIXE */}
        <div className="navbar-spacer" />
        {/* HERO SECTION */}
        <section className="hero-flex">
          <div className="hero-text">
            <h1 className="hero-title">Bienvenue sur HIRIFY</h1>
            <div className="hero-slogan">La plateforme qui connecte <span>alternants</span> et <span>entreprises</span></div>
            <p className="hero-desc">
              Gagnez du temps pour trouver une alternance ou recruter des talents.<br/>
              Simple, efficace, professionnel.
            </p>
            <button className="main-btn" onClick={() => router.push('/register')}>
              Créer un compte
            </button>
          </div>
          <div className="hero-logo">
            <img src={hirifyLogo} alt="Logo Hirify" style={{width:'20vw', minWidth:90, height:'auto', display:'block', marginTop:'50px'}} />
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
