$(document).ready(function() {
    // Function to fetch assets from the server
    function fetchAssets() {
        $.ajax({
            url: 'https://api.yourdomain.com/assets', // Replace with the actual API URL
            type: 'GET',
            dataType: 'json', // Expecting JSON response
            success: function(assets) {
                renderAssets(assets);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Error fetching assets:', textStatus, errorThrown);
                // Handle error
            }
        });
    }

    // Function to render assets on the site
    function renderAssets(assets) {
        var $assetsContainer = $('#assetsContainer');
        $assetsContainer.empty(); // Clear existing assets if any

        $.each(assets, function(i, asset) {
            var $assetDiv = $('<div>').addClass('asset');
            var $thumbnail = $('<img>').attr({
                'src': asset.thumbnail,
                'alt': asset.title
            });
            var $title = $('<p>').text(asset.title);

            $assetDiv.append($thumbnail, $title).appendTo($assetsContainer);
        });
    }

    // Open asset details in a modal
    $('#assetsContainer').on('click', 'div', function() {
        var assetId = $(this).data('assetId');
        // Load asset details based on assetId and display modal
    });

    // Initialize the fetchAssets function when the document is ready
    fetchAssets();
});
