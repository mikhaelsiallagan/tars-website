document.addEventListener('DOMContentLoaded', function () {
    const API_BASE_URL = "xxxxx";

    // Fungsi untuk mengambil dan menampilkan riwayat aktivitas
    async function fetchAndRenderLogs() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/scans`);
            if (!response.ok) throw new Error("Failed to fetch logs");

            const logs = await response.json();
            renderLogs(logs);
        } catch (error) {
            console.error("Error fetching logs:", error);
        }
    }

    // Fungsi untuk mengambil dan memperbarui data donat
    async function fetchAndUpdateDonutChart() {
        try {
            const response = await fetch(`${API_BASE_URL}/donut-data`);
            if (!response.ok) throw new Error("Failed to fetch donut data");

            const data = await response.json();
            updateDonutChart(data);
        } catch (error) {
            console.error("Error fetching donut data:", error);
        }
    }

    // Fungsi untuk memperbarui diagram donat
    function updateDonutChart(data) {
        const ctx = document.getElementById('donutChart').getContext('2d');
        const { labels, values } = data;

        if (window.donutChart instanceof Chart) {
            window.donutChart.destroy();
        }

        window.donutChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Jenis Sampah (%)',
                    data: values,
                    backgroundColor: ['#32CD32', '#FFD700', '#FF4D4D'],
                    hoverOffset: 38
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                }
            }
        });
    }

    // Fungsi untuk merender log aktivitas
    function renderLogs(logs) {
        const logContainer = document.querySelector('.bottom-section');
        logContainer.innerHTML = ''; // Hapus konten dummy sebelumnya

        const groupedLogs = logs.reduce((acc, log) => {
            const date = new Date(log.timestamp).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });

            if (!acc[date]) acc[date] = [];
            acc[date].push(log);
            return acc;
        }, {});

        Object.entries(groupedLogs).forEach(([date, logs]) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `<h4>${date}</h4><ul></ul>`;

            logs.forEach(log => {
                const time = new Date(log.timestamp).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                });

                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <p>Pukul ${time} - ${log.detected_type} 
                    <span class="badge ${getBadgeClass(log.detected_type)} view-image" data-image-url="${log.image_url}">
                        ${getBinLabel(log.detected_type)}
                    </span></p>
                `;
                card.querySelector('ul').appendChild(listItem);
            });

            logContainer.appendChild(card);
        });

        // Tambahkan event listener ke label (badge)
        document.querySelectorAll('.view-image').forEach(label => {
            label.addEventListener('click', function () {
                const imageUrl = label.dataset.imageUrl;
                showImagePopup(imageUrl);
            });
        });
    }

    // Fungsi untuk menampilkan pop-up dengan gambar
    function showImagePopup(imageUrl) {
        const popup = document.createElement('div');
        popup.className = 'image-popup';
        popup.innerHTML = `
            <div class="popup-content">
                <img src="${imageUrl}" alt="Captured Image" />
                <button class="close-popup">Tutup</button>
            </div>
        `;

        document.body.appendChild(popup);

        // Tutup pop-up saat tombol "Tutup" diklik
        popup.querySelector('.close-popup').addEventListener('click', function () {
            popup.remove();
        });
    }
    
    // Fungsi untuk menentukan kelas warna badge
    function getBadgeClass(type) {
        switch (type.toLowerCase()) {
            case 'metal': return 'red';
            case 'paper': return 'yellow';
            case 'plastic': return 'green';
            default: return 'gray';
        }
    }

    // Fungsi untuk menentukan label tong
    function getBinLabel(type) {
        switch (type.toLowerCase()) {
            case 'metal': return 'Tong Merah';
            case 'paper': return 'Tong Kuning';
            case 'plastic': return 'Tong Hijau';
            default: return 'Tong Tidak Diketahui';
        }
    }

    // Panggil fungsi untuk memperbarui data
    fetchAndRenderLogs();
    fetchAndUpdateDonutChart();
});