<template>
    <header class="header">
		<div class="logo-titles">
			<!-- Logo Section -->
			<img src="@/assets/logo.png" alt="Logo" class="logo" />
			<!-- Title Section -->
			<div class="titles">
				<h1 class="title">{{ title }}</h1>
				<h2 class="subtitle"> {{ subtitle }}</h2>
			</div>
		</div>
		
		<!-- Navbar Links -->
		<nav class="navbar">
			<ul class="navbar-links">
			<li v-for="link in links" :key="link.name">
			<router-link :to="link.path" class="nav-link">{{ link.name }}</router-link>
			</li>
		</ul>
		</nav>
    </header>
  </template>
  
<script>
export default {
	name: 'Menu',
	data() {
		return {
			title: 'Dublin City Tree Map',  // Website title
			subtitle: "Explore and Care For Dublin's Urban Forset", // website summary
			links: [
				{ name: 'Tree Inventory', path: '/inventory' },
				{ name: 'Tree Canopy Map', path: '/map' },
				{ name: 'About', path: '/about' },
			]
		};
	}
};
</script>

<style>
.header {
	display: flex;
	justify-content: space-between;
	align-items: flex-end;
	background-color:white;
	padding: 10px 50px;
}
</style>

<style scoped>

/* Brand section with logo and title */
.logo-titles {
	display: flex;
	align-items: flex-end;
	gap: 10px;
	height: 100%;
}

.logo {
	height: 100%;
	/* margin-right: 10px; */
}

.titles {
	height: 100%;
	align-content: end;
}

.title {
	font-size: 46.154px;
	font-style: normal;
	font-weight: 800;
	line-height: normal;
	background: linear-gradient(90deg, #98C455 0%, #495E29 100%);
	background-clip: text;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}

.subtitle{
	color: #000;
	font-size: 14.4px;
	font-style: normal;
	font-weight: 600;
	line-height: normal;
}

/* Navbar links */
.navbar-links {
	list-style: none;
	display: flex;
	gap: 30px;
}

.nav-link  {
	color: #000;
	font-size: 20px;
	font-style: normal;
	font-weight: 400;
	line-height: normal;
}


.nav-link:hover {
	color: #0B8E20;
	text-decoration: underline;
}
</style>
