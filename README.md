# 🚀 Indiaplus Programming Language Engine (v1.0)
**Architect:** Shivam Kumar Jha (Shivam Brahman)

Indiaplus is an independent, natural Hinglish-based programming language engine designed to make web & app development super easy for everyone in India.

## 📌 How to Use

Simply add the CDN link in your project and write your code starting with `Namaste India+`:

```html
<script src="[https://cdn.jsdelivr.net/gh/maharanidevimack-cloud/indiaplus-engine@main/indiaplus.js](https://cdn.jsdelivr.net/gh/maharanidevimack-cloud/indiaplus-engine@main/indiaplus.js)"></script>

<script>
const code = `
Namaste India+

[PAGE]
page1 = splash screen

[DESIGN]
splash screen =
- background pura black hona chahiye
- center mein ek gol logo hona chahiye white color mein "samGo"
- center mein ek search bar hona chahiye "Search here..."
`;

const vm = new IndiaplusVM();
vm.run(code);
</script>
