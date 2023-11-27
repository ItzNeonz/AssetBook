var assets = []

$(document).ready(function() {

    // Initialize the fetchAssets function when the document is ready
    fetchAssets();

    // Open asset details in a modal
    $('#assetsContainer').on('click', 'div', function() {
        var assetId = $(this).attr("id");
        // Load asset details based on assetId and display modal
        var asset = assets.find(obj => obj.id == assetId);
        renderAssetDetail(asset);
    });

    $('.modal-close').on('click', function() {
        hideModal();
    });

    $('.modal-backdrop').on('click', function(event) {
        if ($(event.target).is('.modal-backdrop')) {
            hideModal();
        }
    });

});

// Function to fetch assets from the server
function fetchAssets() {
    $.ajax({
        url: 'https://prod-40.eastus.logic.azure.com/workflows/50108771f88d435c83c09c245045a857/triggers/manual/paths/invoke/AssetBook/v1/assets/?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Y7rI9Y3K2-52f6NViJckt4Q5SA3oBJoHRZ-cmxaJKXs',
        type: 'GET',
        dataType: 'json', // Expecting JSON response
        success: function(data) {
            renderAssets(data);
            assets = data;
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
        var $assetDiv = $('<div>').attr({'id': asset.id});
        var $thumbnail = $('<img>').attr({
            'src': asset.FilePath,
            'alt': asset.Title
        });
        var $title = $('<p>').text(asset.Title);

        $assetDiv.append($thumbnail, $title).appendTo($assetsContainer);
    });
}

function getFileType(fileName) {
    // Define regex for different file types
    const imageRegex = /\.(jpg|jpeg|png|gif|bmp|svg)$/i;
    const videoRegex = /\.(mp4|mov|wmv|avi|flv|mkv)$/i;
    const audioRegex = /\.(mp3|wav|wma|aac|flac)$/i;

    // Check the file type based on the extension
    if (imageRegex.test(fileName)) {
        return 'image';
    } else if (videoRegex.test(fileName)) {
        return 'video';
    } else if (audioRegex.test(fileName)) {
        return 'audio';
    } else {
        return 'unknown'; // If file type is not recognized
    }
}

function renderAssetDetail(asset){
    var $assetModal = $('#assetModal');
    $assetModal.empty();
    var $assetDiv = $('<div>');
    var $thumbnail;

    switch (getFileType(asset.FileName)){
        case "image":
            $thumbnail = $('<img>').attr({
                'src': asset.FilePath,
                'alt': asset.Title
            });
            break;
        case "audio":
            $thumbnail = $('<audio />').attr({
                'controls': true
            });

            var src = $('<source />', { src: asset.FilePath, type: 'audio/mpeg' });
            var sourceOgg = $('<source />', { src: asset.FilePath, type: 'audio/ogg' });
            $thumbnail.append(src, sourceOgg);
            break;
        case "video":
            $thumbnail = $('<video />').attr({
                'controls': true,
            });

            var $sourceMp4 = $('<source />', { src: asset.FilePath, type: 'video/mp4' });
            var $sourceOgg = $('<source />', { src: asset.FilePath, type: 'video/ogg' });
            $thumbnail.append($sourceMp4, $sourceOgg);
            break;
    }

    var $title = $('<h2>').text(asset.Title);
    var obj = new Date(asset.Date);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    var $date = $('<h4>').text("Uploaded on: " + obj.toLocaleDateString('en-GB', options).replace(/ /g, '-'));
    var $desc = $('<p>').text(asset.Description);
    $assetDiv.append($thumbnail, $title, $date, $desc).appendTo($assetModal);
    showModal();
}

function showModal() {
    $('.modal-backdrop').addClass('show');
    $('#assetModal').addClass('show');
}

function hideModal() {
    $('.modal-backdrop').removeClass('show');
    $('#assetModal').removeClass('show');
}