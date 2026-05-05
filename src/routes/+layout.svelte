<script>
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Uncloud Day 2026</title>
	<meta name="description" content="Join us for Uncloud Day 2026, a day dedicated to exploring the future of decentralized technology and personal data sovereignty." />
</svelte:head>

<nav>
	<div class="nav-content">
		<a href="/" class="logo">
			<img src="/logo.png" alt="Uncloud Logo" />
			<span>day.uncloud.eth</span>
		</a>
		<div class="links">
			<a href="#about">About</a>
			<a href="#schedule">Schedule</a>
			<a href="#venue">Venue</a>
			<!--a href="#join">RSVP</a-->
			<a href="#faq">FAQ</a>
		</div>
	</div>
</nav>

<main>
	{@render children()}
</main>

<style>
	nav {
		position: fixed;
		top: 0;
		width: 100%;
		z-index: 1000;
		background: rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.nav-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 1rem 20px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 800;
		font-size: 1.25rem;
	}

	.logo img {
		height: 32px;
	}

	.links {
		display: flex;
		gap: 2rem;
		font-weight: 600;
	}

	.links a:hover {
		color: var(--accent-yellow);
	}

	main {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		padding-top: 70px;
	}
</style>
