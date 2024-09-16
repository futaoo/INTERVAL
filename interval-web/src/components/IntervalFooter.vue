<template>
  <footer class="footer">
    <div class="footer-content">
        <p>&copy; {{ currentYear }} INTERVAL Project. All rights reserved.&nbsp;
            <a href="https://www.sfi.ie/privacy/" target="_blank">Privacy Policy</a>&nbsp;
            <a href="https://www.sfi.ie/terms-of-use/" target="_blank">Terms of Use</a>
        </p>
    </div>
    <div class="others">
        <router-link to="/">Contribute to Your Tree Data</router-link>
    </div>
  </footer>
</template>

<script setup>
// Using Composition API to dynamically display the current year
const currentYear = new Date().getFullYear();
</script>


<style scoped>
/* Basic styling for the footer */
.footer {
    display: flex;
}

.footer-content {
  background-color: rgba(152, 196, 85, 0.60);
  align-content: center;
  padding: 0px 10px;

}

.footer-content p {
  color: white;
}

.footer-content a {
  color: white;
  text-decoration: underline;
}

.others {
  flex-grow: 1;
  align-content: center;
  background-color: #8B9DFD;
  padding-left: 10px;
}

.others router-link {
    color: white;
    text-decoration: underline;

}

</style>
