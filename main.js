var assets = []

$(document).ready(function() {

    $(document).on('click', '#logoutButton', function() {
        localStorage.clear();
        setHeader();
      });

    $('#adminLogoutButton').click(function() {
        localStorage.clear();
        window.location.href = 'index.html';
    });

      if(!window.location.pathname.includes('register.html'))
      {
        fetchAssets();
      }

    // Open asset details in a modal
    $('#assetsContainer').on('click', 'div', function() {
        var assetId = $(this).attr("id");
        var asset = assets.find(obj => obj.id == assetId);
        renderAssetDetail(asset);
    });

    $('#loginButton').on('click', function() {
        showModal('Login');
      });

    $('.modal-close').on('click', function() {
        hideModal('Asset');
        hideModal('Login');
    });

    $('.asset-modal-backdrop').on('click', function(event) {
        if ($(event.target).is('.asset-modal-backdrop')) {
            hideModal('Asset');
        }
    });

    $('.login-modal-backdrop').on('click', function(event) {
        if ($(event.target).is('.login-modal-backdrop')) {
            hideModal('Login');
        }
    });

    $('#loginForm').on('submit', function(event) {
        event.preventDefault();
        login();
    });

    $('#registrationForm').on('submit', function(event) {
        event.preventDefault();
        registerUser();
    });

    $('#createAsset').click(function() {
        showModal('Upload');
    });

    $('.modal-close').click(function() {
        hideModal('Upload');
    });

    $('.cancel').click(function() {
        hideModal('Upload');
    });

    $('#file').change(function() {
        var fileInput = $(this)[0];
        if (fileInput.files && fileInput.files[0]) {
            $('#filename').val(fileInput.files[0].name);
        }
    });

    $('#assetUploadForm').submit(function(e) {
        e.preventDefault();
        var formData = new FormData(this);
        var currUser = JSON.parse(localStorage.getItem('currUser'));
        formData.append('Auth-Key', currUser['Auth-Key']);
        formData.append('Email', currUser.Email);
        uploadAsset(formData);
    });

    setHeader();
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
    showModal('Asset');
}

function login(){
    var email = $('#email').val();
    var password = $('#password').val();
    $.ajax({
        url: 'https://prod-35.eastus.logic.azure.com/workflows/24f2f6f0e3314b2eab11fdb26a1ed623/triggers/manual/paths/invoke/assetbook/v1/login?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=yeAq4xGNR9gD1N4obVEwCgVefPA42ETRccaQPNECqy0',
        type: 'POST',
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        data: JSON.stringify({
          "Email": email,
          "Password": password
        }),
        success: function(response) {
          if(response.Success == "True") {
            hideModal('Login');
            localStorage.setItem('currUser', JSON.stringify(response));
            setHeader();
          } else {
            alert('Login failed: ' + response.Error);
          }
        },
        error: function(xhr, status, error) {
          // If there is an AJAX error
          alert('An error occurred: ' + error);
        }
    });
}

function registerUser(){
    var firstName = $('#firstName').val().trim();
    var lastName = $('#lastName').val().trim();
    var email = $('#email').val().trim();
    var password = $('#password').val();
    var retypePassword = $('#retypePassword').val();

    if (!firstName || !lastName || !email || !password || !retypePassword) {
        alert('All fields are required.');
        return false;
    }

    if (password !== retypePassword) {
        alert('Passwords do not match.');
        return false;
    }

    var userData = {
        "FirstName": firstName,
        "LastName": lastName,
        "Email": email,
        "Password": password
    };

    $.ajax({
        url: 'https://prod-13.eastus.logic.azure.com:443/workflows/7f0fc08851614452b243aa64e72c0fd8/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=4hUtJo1K1l0TszRPvXDcmWXWA35AwtNi1fF8Of82RTE',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(userData),
        success: function(response) {
            if(response.Success == "True") {
                localStorage.setItem('currUser', JSON.stringify(response));
                window.location.href = 'index.html';
            } else {
                alert('Registration failed: ' + response.Error);
            }
            
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Registration failed:', textStatus, errorThrown);
            alert('Registration failed: ' + errorThrown);
        }
    });
}

function uploadAsset(formData){

    $.ajax({
        url: 'https://prod-68.eastus.logic.azure.com/workflows/e6959e5b8e1247a482b4cc2b16134062/triggers/manual/paths/invoke/assetbook/v1/asset/create?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ebX3TKgwp2w1cYipnmYuycjI5JNQjYLNlx-3jN7LFO0',
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function(response) {
            location.reload();
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log('Upload failed: ' + textStatus);
            alert('Upload failed: ' + errorThrown);
        }
    });
}

function showModal(type){
    switch(type){
        case "Asset":
            $('.asset-modal-backdrop').addClass('show');
            $('#assetModal').addClass('show');
            hideModal("Login");
            hideModal("Upload");
            break;
        
        case "Login":
            $('.login-modal-backdrop').addClass('show');
            $('#loginModal').addClass('show');
            hideModal('Asset');
            hideModal('Upload');
            break;

        case "Upload":
            $('.upload-modal-backdrop').addClass('show');
            $('#assetUploadModal').addClass('show');
            hideModal('Asset');
            hideModal('Login');
            break;
        
    }
}

function hideModal(type){
    switch(type){
        case "Asset":
            $('.asset-modal-backdrop').removeClass('show');
            $('#assetModal').removeClass('show');
            break;
        
        case "Login":
            $('.login-modal-backdrop').removeClass('show');
            $('#loginModal').removeClass('show');
            break;

        case "Upload":
            $('.upload-modal-backdrop').removeClass('show');
            $('#assetUploadModal').removeClass('show');
            break;
    }
}

function setHeader(){
    if(localStorage.getItem('currUser')){
        var currUser = JSON.parse(localStorage.getItem('currUser'));
        if(currUser.Type == "Admin")
        {
            $('#userArea').hide();
            $('#adminHeader').show();
        }
        else if(currUser.Type == "User")
        {
            $('#userName').text(currUser.Username);
            $('#loginButton').replaceWith('<button id="logoutButton">Logout</button>');
            $('#userArea').show();
            $('#adminHeader').hide();
        }
    }
    else
    {
        $("#logoutButton").replaceWith('<button id="loginButton">Login</button>');
        $('#userName').text('Guest User');
        $('#loginButton').on('click', function() {
            showModal('Login');
        });
        $('#adminHeader').hide();
        $('#userArea').show();
    }
}

        