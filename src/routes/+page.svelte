<script>
  import { fade } from 'svelte/transition';
  import { onMount } from 'svelte';
  import { connectWallet, createAndSignAttestation, fetchAttendees, resolveEnsData } from '$lib/eas.js';

  let isMapExpanded = $state(false);
  let walletAddress = $state(null);
  let walletClient = $state(null);
  let attendees = $state([]);
  let isLoadingAttendees = $state(true);
  let isSigning = $state(false);
  let errorMsg = $state('');

  async function loadAttendees() {
    isLoadingAttendees = true;
    try {
      const rawAttendees = await fetchAttendees();
      attendees = await Promise.all(rawAttendees.map(async (att) => {
        const ens = await resolveEnsData(att.attester);
        return { ...att, name: ens.name, avatar: ens.avatar };
      }));
    } finally {
      isLoadingAttendees = false;
    }
  }

  onMount(async () => {
    try {
      await loadAttendees();
    } catch (e) {
      console.error("Failed to fetch attendees", e);
    }
  });

  async function handleJoin() {
    try {
      errorMsg = '';
      if (!walletAddress) {
        const result = await connectWallet();
        walletClient = result.walletClient;
        walletAddress = result.address;
      }
      isSigning = true;
      await createAndSignAttestation(walletClient, walletAddress);
      await loadAttendees();
    } catch (e) {
      errorMsg = e.message || String(e);
      console.error(e);
    } finally {
      isSigning = false;
    }
  }

  const schedule = [
    { start: '10:00', duration: '180 min', event: '[doors open]', speaker: 'chilling, networking' },
    { start: '12:00', duration: '30 min', event: 'What is Uncloud?', speaker: 'group discussion' },
    { start: '12:30', duration: '30 min', event: 'cjp2p', speaker: 'Kermit' },
    { start: '13:00', duration: '30 min', event: 'deboot update', speaker: 'Chris'},
    { start: '13:30', duration: '30 min', event: 'Bee in Browser', speaker: 'Pavel' },
    { start: '14:00', duration: '30 min', event: '*TBC', speaker: 'Viktor' },
    { start: '14:30', duration: '30 min', event: '*TBC', speaker: 'Aata.eth'},
    { start: '15:00', duration: '30 min', event: '*TBC', speaker: 'Casey'},
    { start: '15:30', duration: '30 min', event: '*TBC', speaker: 'TBC'},
    { start: '16:00', duration: '30 min', event: '[closing]', speaker: 'heading to ', linkText: 'Web3Privacy Now Meetup', linkUrl: 'https://luma.com/98pzi0jh', speakerSuffix: ' together' }
  ];

  const faqs = [
    { q: 'Who is this for?', a: 'This event is for everybody who is interested in decentralized technologies.' },
    { q: 'Is there an entrance fee?', a: 'Entrance is completely free and everybody is welcome!' },
    { q: 'Will there be food and drinks?', a: 'We do not provide food or drinks, but some basic drinks can be purchased directly at the venue.' }
  ];

  function toggleMap() {
    isMapExpanded = !isMapExpanded;
  }
</script>

<div class="page-container">
  <!-- Hero Section -->
  <section id="home" class="hero animate-fade">
    <div class="hero-content">
      <img src="/logo.png" alt="Uncloud Day Logo" class="main-logo" />
      <h1>Uncloud Day 2026</h1>
      <p class="subtitle">Decentralize the Internet.</p>
      <div class="event-info">
        <p class="date">Thursday 7. May 2026</p>
        <p class="location">@ LibertyLoft, Prague, Czech Republic</p>
        <p class="time-slot">10:00 - 16:30</p>
      </div>
      <div class="cta-group">
        <a href="#about" class="btn-primary">Learn More</a>
        <a href="#schedule" class="btn-secondary">Check Schedule</a>
        <a href="#join" class="btn-secondary">RSVP / Join</a>
      </div>
    </div>
  </section>

  <!-- About Section -->
  <section id="about">
    <div class="glass-card">
      <h2>About the Event</h2>
      <p>
        Uncloud Open Research is a working group asking how to undo the cloud, finding the right balance between self-hosting on hardware you actually own and leaning on decentralised networks with real economic incentives, like Swarm for storage, ENS for naming, and open silicon with TEEs for trust. Active since 2022, no coin, no roadmap to sell. This event is an open invitation to sit in on the thinking and push on it.
      </p>
    </div>
  </section>

  <!-- Schedule Section -->
  <section id="schedule">
    <div class="section-header">
      <h2>Event Schedule</h2>
    </div>
    <div class="schedule-compact glass-card">
      {#each schedule as item}
        <div class="schedule-row">
          <div class="time-block-compact">
            <span class="t-start-prominent">{item.start}</span>
            <span class="t-duration-subtle">{item.duration}</span>
          </div>
          <div class="event-info-compact">
            <span class="e-title">{item.event}</span>
            <span class="e-speaker">
              {#if item.event && item.linkText}
                {item.speaker}
                <a href={item.linkUrl} target="_blank" class="meetup-link">{item.linkText}</a>
                {item.speakerSuffix}
              {:else}
                {item.speaker}
                {#if item.handle}
                  <a href={item.url} target="_blank" class="speaker-handle">({item.handle})</a>
                {/if}
              {/if}
            </span>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <!-- Venue Section (Merged with Transport) -->
  <section id="venue">
    <div class="section-header">
      <h2>The Venue & How to Get There</h2>
    </div>
    <div class="glass-card venue-card">
      <a href="https://libertyloft.cz/" target="_blank" class="venue-logo-link">
        <img src="/venue-logo.png" alt="LibertyLoft Logo" class="venue-logo" />
      </a>
      <div class="venue-info">
        <p>
          <a href="https://libertyloft.cz/" target="_blank" class="text-link">LibertyLoft</a> is a community space in the heart of Prague dedicated to free-thinking individuals. 
          An open environment for sharing ideas and building connections.
        </p>
        
        <div class="venue-details-grid">
          <div class="address-block">
            <h4>Address</h4>
            <p>Papírenská 120/12, 160 00 Praha 6-Bubeneč</p>
            <div class="map-links">
              <a href="https://www.google.com/maps/search/?api=1&query=LibertyLoft+Papírenská+120/12,+160+00+Praha+6" target="_blank" class="btn-sm">Google Maps</a>
              <a href="https://www.openstreetmap.org/search?query=Papírenská+120/12,+160+00+Praha+6" target="_blank" class="btn-sm">OSM</a>
            </div>
          </div>

          <div class="transport-info-merged">
            <h4>Public Transport</h4>
            <div class="transport-item-mini">
              <span class="icon">🚆</span>
              <p><strong>Train:</strong> Praha-Podbaba</p>
            </div>
            <div class="transport-item-mini">
              <span class="icon">🚋</span>
              <p><strong>Tram:</strong> Nádraží Podbaba</p>
            </div>
            <div class="transport-item-mini">
              <span class="icon">🚌</span>
              <p><strong>Bus:</strong> Nemocnice Bubeneč</p>
            </div>
          </div>
        </div>

        <div class="map-container-merged">
          <button class="map-trigger" on:click={toggleMap} aria-label="Expand map">
            <img src="/map.jpg" alt="Venue Map" class="venue-map-mini" />
            <span class="expand-hint">Click to expand map</span>
          </button>
        </div>
      </div>
    </div>
  </section>

  <div class="map-overlay" class:active={isMapExpanded} on:click={toggleMap}>
    <div class="map-modal" on:click|stopPropagation>
      <button class="close-btn" on:click={toggleMap} aria-label="Close modal">&times;</button>
      <img src="/map.jpg" alt="Large Venue Map" class="venue-map-large" />
    </div>
  </div>

  <!-- Join Section -->
  <section id="join">
    <div class="section-header">
      <h2>Join Uncloud Day 2026</h2>
      <p class="subtitle">Sign in with your Ethereum wallet to verify your attendance via the Ethereum Attestation Service (EAS). Attestations are stored offchain, so there are zero transaction fees.</p>
    </div>
    
    <div class="glass-card join-card">
      {#if errorMsg}
        <div class="error-msg">{errorMsg}</div>
      {/if}

      <div class="privacy-notice">
        <strong>Protect your privacy!</strong><br />
        Please use your externally known public address or create a brand new one dedicated to this event.
      </div>
      
      <div class="join-actions">
        <button class="btn-primary" on:click={handleJoin} disabled={isSigning}>
          {#if isSigning}
            Signing...
          {:else if walletAddress}
            Sign Attestation
          {:else}
            Connect Wallet & Join
          {/if}
        </button>
      </div>

      {#if walletAddress}
        <p class="connected-info">Connected as: <strong>{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</strong></p>
      {/if}

      <div class="attendees-list">
        <h3>Confirmed Attendees ({attendees.length})</h3>
        {#if isLoadingAttendees}
          <div class="attendee-loader">
            <div class="loader-spinner"></div>
            <span>Loading...</span>
          </div>
        {:else if attendees.length === 0}
          <p>No one has attested yet. Be the first!</p>
        {:else}
          <ul class="attendee-items">
            {#each attendees as att}
              <li>
                <a href="https://easscan.org/offchain/attestation/view/{att.id}" target="_blank" rel="noopener noreferrer" class="attendee-pill">
                  {#if att.avatar}
                    <img src={att.avatar} alt="ENS Avatar" class="att-avatar" />
                  {:else}
                    <div class="att-avatar-placeholder"></div>
                  {/if}
                  <span class="att-name">{att.name || `${att.attester.slice(0, 6)}...${att.attester.slice(-4)}`}</span>
                </a>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </div>
  </section>

  <!-- FAQ Section -->
  <section id="faq">
    <div class="section-header">
      <h2>Frequently Asked Questions</h2>
    </div>
    <div class="faq-grid">
      {#each faqs as faq}
        <div class="faq-item glass-card">
          <h3>{faq.q}</h3>
          <p>{faq.a}</p>
        </div>
      {/each}
    </div>
  </section>

  <!-- Footer -->
  <footer>
    <div class="footer-content">
      <img src="/logo.png" alt="Uncloud Logo" class="footer-logo" />
      <p>Organized by Uncloud Open Research, a nonprofit open collective.</p>
      <p>Source code: <a href="https://app.radicle.xyz/nodes/seed.pp0.co/rad%3AzP2BLJhnCDBiokEgD6PqTSeQLW1r">Radicle</a>, <a href="https://github.com/burningtree/uncloud-day-2026">GitHub</a></p>
    </div>
  </footer>
</div>

<style>
  .page-container {
    width: 100%;
  }

  /* Hero */
  .hero {
    min-height: 90vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .main-logo {
    width: 280px;
    height: auto;
    margin-bottom: 2rem;
    filter: drop-shadow(0 10px 20px rgba(0,0,0,0.2));
    animation: float 6s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }

  h1 {
    font-size: clamp(3rem, 8vw, 5rem);
    margin-bottom: 1rem;
    text-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  .subtitle {
    font-size: 1.5rem;
    color: var(--text-muted);
    margin-bottom: 2rem;
  }

  .event-info {
    margin-bottom: 3rem;
  }

  .date {
    font-size: 1.8rem;
    font-weight: 800;
    color: var(--accent-yellow);
    margin: 0;
  }

  .location {
    font-size: 1.2rem;
    font-weight: 600;
    opacity: 0.9;
    margin-top: 0.5rem;
  }

  .time-slot {
    font-size: 1.4rem;
    font-weight: 700;
    margin-top: 1rem;
    color: var(--text-main);
  }

  .cta-group {
    display: flex;
    gap: 1.5rem;
    justify-content: center;
  }

  .btn-secondary {
    background: transparent;
    border: 2px solid white;
    color: white;
    padding: 12px 32px;
    border-radius: 50px;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .btn-secondary:hover {
    background: white;
    color: var(--primary-pink);
  }

  /* About */
  #about p {
    font-size: 1.25rem;
    line-height: 1.8;
    max-width: 860px;
    margin: 0 auto;
  }

  h2 {
    font-size: 2.5rem;
    margin-bottom: 2rem;
    text-align: center;
  }

  .stats {
    display: flex;
    justify-content: space-around;
    margin-top: 3rem;
    gap: 2rem;
    flex-wrap: wrap;
  }

  .stat-item {
    text-align: center;
  }

  .stat-val {
    display: block;
    font-size: 3rem;
    font-weight: 800;
    color: var(--accent-yellow);
  }

  /* Join Section */
  .join-card {
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
  }

  .privacy-notice {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.85);
    background: rgba(255, 255, 255, 0.05);
    border-left: 3px solid var(--accent-yellow);
    padding: 1rem;
    margin-bottom: 1.5rem;
    text-align: left;
    border-radius: 4px;
    line-height: 1.4;
  }

  .join-actions {
    margin: 2rem 0;
  }

  .connected-info {
    font-size: 0.9rem;
    opacity: 0.8;
    margin-bottom: 2rem;
  }

  .error-msg {
    background: rgba(255, 0, 0, 0.2);
    border: 1px solid red;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    color: #ffcccc;
  }

  .attendees-list {
    margin-top: 2rem;
    text-align: left;
    background: rgba(0, 0, 0, 0.2);
    padding: 1.5rem;
    border-radius: 12px;
  }

  .attendees-list h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1.2rem;
    color: var(--accent-yellow);
  }

  .attendee-loader {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    opacity: 0.8;
  }

  .loader-spinner {
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    border-top-color: var(--accent-yellow);
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .attendee-items {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
  }

  .attendee-items li {
    display: block;
  }

  .attendee-pill {
    background: rgba(255, 255, 255, 0.1);
    padding: 0.4rem 1rem 0.4rem 0.4rem;
    border-radius: 30px;
    font-family: inherit;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    border: 1px solid rgba(255,255,255,0.05);
    transition: transform 0.2s ease, background 0.2s ease;
    text-decoration: none;
    color: inherit;
  }

  .attendee-pill:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.15);
  }

  .att-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: cover;
  }

  .att-avatar-placeholder {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--accent-yellow) 0%, var(--primary-pink) 100%);
    opacity: 0.8;
  }

  .att-name {
    font-weight: 500;
  }

  /* Schedule Compact */
  .schedule-compact {
    max-width: 800px;
    margin: 0 auto;
    padding: 1.5rem;
  }

  .schedule-row {
    display: flex;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    gap: 3rem;
  }

  .schedule-row:last-child {
    border-bottom: none;
  }

  .time-block-compact {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 80px;
    line-height: 1.1;
  }

  .t-start-prominent {
    font-size: 1.4rem;
    font-weight: 800;
    color: var(--accent-yellow);
  }

  .t-duration-subtle {
    font-size: 0.85rem;
    opacity: 0.6;
    font-weight: 600;
  }

  .event-info-compact {
    display: flex;
    flex-direction: column;
    text-align: left;
  }

  .e-title {
    font-size: 1.2rem;
    font-weight: 700;
    color: white;
  }

  .meetup-link {
    color: var(--accent-yellow);
    text-decoration: underline;
    font-weight: 700;
    transition: color 0.2s ease;
  }

  .meetup-link:hover {
    color: white;
  }

  .e-speaker {
    font-size: 1.1rem;
    font-weight: 600;
    opacity: 0.9;
    color: var(--accent-yellow);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .speaker-handle {
    font-size: 0.9rem;
    color: white;
    opacity: 0.7;
    text-decoration: none;
    font-weight: 400;
    transition: opacity 0.2s ease;
  }

  @media (max-width: 600px) {
    .schedule-row {
      flex-direction: column;
      gap: 0.5rem;
      align-items: flex-start;
      padding: 1.5rem;
    }
    
    .time-range {
      min-width: auto;
      font-size: 1rem;
    }
  }

  /* Venue Card (Merged) */
  .venue-card {
    max-width: 900px;
    margin: 0 auto;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    padding: 3rem;
  }

  .venue-logo {
    max-width: 200px;
    height: auto;
    filter: drop-shadow(0 5px 15px rgba(0,0,0,0.3));
    transition: transform 0.3s ease;
  }

  .venue-logo-link:hover .venue-logo {
    transform: scale(1.05);
  }

  .text-link {
    color: var(--accent-yellow);
    text-decoration: underline;
    font-weight: 700;
  }

  .text-link:hover {
    color: white;
  }

  .venue-info h3 {
    font-size: 2.2rem;
    margin-bottom: 0.5rem;
    color: var(--accent-yellow);
  }

  .venue-details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    margin-top: 2rem;
    text-align: left;
    width: 100%;
  }

  .venue-details-grid h4 {
    font-size: 1.1rem;
    color: var(--accent-yellow);
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 1rem;
  }

  .address-block p {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
    line-height: 1.6;
  }

  .btn-sm {
    font-size: 0.85rem;
    padding: 8px 20px;
    border: 1px solid rgba(255,255,255,0.4);
    border-radius: 20px;
    color: white;
    text-decoration: none;
    transition: all 0.2s ease;
    display: inline-block;
    margin-right: 0.5rem;
  }

  .btn-sm:hover {
    background: white;
    color: black;
    border-color: white;
  }

  .transport-info-merged {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .transport-item-mini {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 1rem;
  }

  .transport-item-mini .icon {
    font-size: 1.4rem;
    min-width: 32px;
  }

  .transport-item-mini p {
    margin: 0;
  }

  .map-container-merged {
    width: 100%;
    margin-top: 2rem;
  }

  .map-trigger {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    width: 100%;
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  }

  .map-trigger:hover {
    transform: scale(1.01);
    box-shadow: 0 15px 40px rgba(0,0,0,0.4);
  }

  .venue-map-mini {
    width: 100%;
    height: auto;
    display: block;
  }

  .expand-hint {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0,0,0,0.7);
    color: white;
    padding: 12px;
    font-size: 0.9rem;
    backdrop-filter: blur(8px);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .map-trigger:hover .expand-hint {
    opacity: 1;
  }

  /* Lightbox Overlay */
  .map-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.95);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    backdrop-filter: blur(15px);
    
    /* Initially hidden */
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: opacity 0.3s ease, visibility 0.3s ease;
  }

  .map-overlay.active {
    opacity: 1;
    visibility: visible;
    pointer-events: all;
  }

  .map-modal {
    position: relative;
    max-width: 95vw;
    max-height: 95vh;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 25px 60px rgba(0,0,0,0.6);
    background: rgba(255, 255, 255, 0.05);
  }

  .venue-map-large {
    max-width: 100%;
    max-height: 90vh;
    display: block;
    object-fit: contain;
  }

  .close-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(255,255,255,0.2);
    border: none;
    color: white;
    font-size: 2.5rem;
    line-height: 1;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
    transition: background 0.2s ease, transform 0.2s ease;
    z-index: 2010;
  }

  .close-btn:hover {
    background: rgba(255,255,255,0.4);
    transform: scale(1.1);
  }

  @media (max-width: 768px) {
    .venue-details-grid {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
    
    .venue-card {
      padding: 2rem 1.5rem;
    }

    .venue-logo {
      max-width: 150px;
    }
  }

  /* FAQ */
  .faq-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }

  .section-header {
    margin-bottom: 3rem;
    text-align: center;
  }

  /* Footer */
  footer {
    padding: 60px 20px;
    background: rgba(0,0,0,0.1);
    margin-top: 100px;
  }

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    text-align: center;
  }

  .footer-logo {
    width: 60px;
    margin-bottom: 1.5rem;
  }

  .social-links {
    margin-top: 2rem;
    display: flex;
    justify-content: center;
    gap: 2rem;
    font-weight: 600;
    opacity: 0.8;
  }
</style>
