var currentlySelectedRow = null;
var myChart = null;
var selectedType = null;

$(document).ready(function () {
    var buttons = document.getElementsByClassName("buttonX");
    var create_button = document.getElementById("create-button");
    var changeable_labels = document.getElementsByClassName("change-text-label");
    //var graphDropdown = document.getElementById("graphSelect");
    //var inputs = document.getElementsByName("textX");

    

    /*for (var i = 0; i < inputs.length; i++) {
        inputs[i].addEventListener("input", function () {
            onInputEdit()
        })
    }*/

    /* Set up dropdown */
    /*graphDropdown.addEventListener("change", function() {
        var graphInputFieldHTML = document.getElementById("GraphInputFields");
        if (this.value === "Sinusoid") {
            graphInputFieldHTML.innerHTML = `
            <div class="row">
                <div class="col-1" style="display:flex; flex-direction: row; justify-content: center; align-items: center">
                  <label for="Amplitude">Amplitude:</label>
                </div>
                <div class="col-1" style="display:flex; flex-direction: row; justify-content: center; align-items: center">
                  <input type="text", name="textX", value="" id="amplitude-text" size="5">
                </div>
                <div class="col-10">
                  <div class="slidecontainer">
                    <input type="range" min="1" max="100" value="100" class="slider" id="amplitude-slider">
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-1" style="display:flex; flex-direction: row; justify-content: center; align-items: center">
                  <label for="Frequency">Frequency:</label>
                </div>
                <div class="col-1" style="display:flex; flex-direction: row; justify-content: center; align-items: center">
                  <input type="text", name="textX", value="" id="frequency-text" size="5">
                </div>
                <div class="col-10">
                  <div class="slidecontainer">
                    <input type="range" min="1" max="100" value="100" class="slider" id="frequency-slider">
                  </div>
                </div>
              </div>
            `
            document.getElementById("amplitude-text").addEventListener("input", function() {
                onInputEdit()
            })
            document.getElementById("frequency-text").addEventListener("input", function() {
                onInputEdit()
            })
        }
        else if (this.value === "Linear") {
            graphInputFieldHTML.innerHTML = `
            <div class="row">
              <div class="row">
                <div class="col-1" style="display:flex; flex-direction: row; justify-content: center; align-items: center">
                  <label for="Slope">Slope:</label>
                </div>
                <div class="col-1" style="display:flex; flex-direction: row; justify-content: center; align-items: center">
                  <input type="text", name="textX", value="" id="slope-text" size="5">
                </div>
                <div class="col-10">
                  <div class="slidecontainer">
                    <input type="range" min="1" max="100" value="100" class="slider" id="slope-slider">
                  </div>
                </div>
              </div>
            `
            document.getElementById("slope-text").addEventListener("input", function() {
                onInputEdit()
            })
        }
    })*/

    /* Set up create button */
    create_button.addEventListener("click", function() {
        fetch('/add_new')
        .then(function(response) {
            return response.json()
        })
        .then(function(text) {
            var table_container = document.getElementById("table-container");
            table_container.insertAdjacentHTML("beforeend", `
            <div class="row"> 
                <div class="col-6" id="standard-row">
                    <input type="text", name="`+ text.response + `", value="NewColumn" class="change-text-label">
                </div>
                <div class="col-6" id="standard-row">
                  <button type="button" class="btn btn-primary btn-sm buttonX" id="buttonX" name="`+ text.response +`"> Edit </button>
                </div>
            </div>
            `)

            buttons[parseInt(text.response)].addEventListener("click", function() {
                editButtonListener(this.name)
            })

            changeable_labels[parseInt(text.response)].addEventListener("focusout", function() {
                editLabelListener(this.name, this.value)
            })
        })
    })
    

    /* Set up listener for Edit buttons per row */
    for (i=0; i<buttons.length; i++) 
        buttons[i].addEventListener("click", function() {
            editButtonListener(this.name)
        })

    for (i=0; i<changeable_labels.length; i++){
        changeable_labels[i].addEventListener("focusout", function() {
            editLabelListener(this.name, this.value)
        })
    }
})

function editButtonListener(button_id){
    currentlySelectedRow = button_id
    LoadDetails()
}

function editLabelListener(label_id, new_label){
    fetch('/change_name?' + new URLSearchParams({id: label_id, new_name: new_label}))
}

function onInputEdit() {

    var re = /[0-9]+.$/;
    if (!re.test(document.getElementById("noise-text").value)) {
        if (document.getElementById("graphSelect").value === "Sinusoid") {
            if (!isNaN(parseInt(document.getElementById("samples-text").value)) &&
                !isNaN(parseInt(document.getElementById("amplitude-text").value)) &&
                !isNaN(parseInt(document.getElementById("frequency-text").value)) &&
                !isNaN(parseInt(document.getElementById("offset-text").value)) &&
                !isNaN(parseFloat(document.getElementById("noise-text").value))) {

                    fetch('/set_data?' + new URLSearchParams({id: currentlySelectedRow,
                                                            type: "Sinusoid",
                                                            sampleCount: document.getElementById("samples-text").value,
                                                            amplitude: document.getElementById("amplitude-text").value,
                                                            frequency: document.getElementById("frequency-text").value,
                                                            offset: document.getElementById("offset-text").value,
                                                            noise: document.getElementById("noise-text").value,
                                                            amp_slider : document.getElementById("amplitude-slider").value,
                                                            freq_slider : document.getElementById("frequency-slider").value,
                                                            offset_slider : document.getElementById("offset-slider").value,
                                                            noise_slider : document.getElementById("noise-slider").value}))
                    .then(function (response) {
                        return response.json()
                    })
                    .then(function (data) {

                        if (myChart != null) {
                            myChart.destroy()
                        }

                        const ctx = document.getElementById("chart").getContext('2d');
                        myChart = new Chart(ctx, {
                            type: 'line',
                            data: {
                                labels: data.xaxis,
                                datasets: [{
                                label: 'Curve',
                                backgroundColor: 'rgba(161, 198, 247, 1)',
                                borderColor: 'rgb(47, 128, 237)',
                                data: data.data,
                                pointRadius: 0,
                                fill: false,
                                }]
                            },
                            options: {
                                responsive:true,
                                maintainAspectRatio: false,
                                scales: {
                                yAxes: [{
                                    ticks: {
                                    beginAtZero: true,
                                    autoSkipPadding: 21,
                                    }
                                }]
                                }
                            },
                        });
                    })
            }
        }
        else if (document.getElementById("graphSelect").value === "Linear") {
            if (!isNaN(parseInt(document.getElementById("samples-text").value)) &&
                !isNaN(parseInt(document.getElementById("slope-text").value)) &&
                !isNaN(parseInt(document.getElementById("offset-text").value)) &&
                !isNaN(parseFloat(document.getElementById("noise-text").value))) {

                    fetch('/set_data?' + new URLSearchParams({id: currentlySelectedRow,
                                                            type: "Linear",
                                                            sampleCount: document.getElementById("samples-text").value,
                                                            slope: document.getElementById("slope-text").value,
                                                            offset: document.getElementById("offset-text").value,
                                                            noise: document.getElementById("noise-text").value,
                                                            slope_slider: document.getElementById("slope-slider").value,
                                                            offset_slider : document.getElementById("offset-slider").value,
                                                            noise_slider : document.getElementById("noise-slider").value}))
                    .then(function (response) {
                        return response.json()
                    })
                    .then(function (data) {

                        if (myChart != null) {
                            myChart.destroy()
                        }

                        const ctx = document.getElementById("chart").getContext('2d');
                        myChart = new Chart(ctx, {
                            type: 'line',
                            data: {
                                labels: data.xaxis,
                                datasets: [{
                                label: 'Curve',
                                backgroundColor: 'rgba(161, 198, 247, 1)',
                                borderColor: 'rgb(47, 128, 237)',
                                data: data.data,
                                pointRadius: 0,
                                fill: false,
                                }]
                            },
                            options: {
                                responsive:true,
                                maintainAspectRatio: false,
                                scales: {
                                yAxes: [{
                                    ticks: {
                                    beginAtZero: true,
                                    autoSkipPadding: 21,
                                    }
                                }]
                            }
                        },
                    });
                })
            }
        }
    }
}

function LoadDetails() {

    fetch('/get_type?' + new URLSearchParams({id: currentlySelectedRow}))
    .then(function (response) {
        response.json()
        .then(function (json) {
            selectedType = json.type
        })
    })

    fetch('/get_details?' + new URLSearchParams({id: currentlySelectedRow}))
    .then(function (response) {
        response.text()
        .then(function (text) {
            document.getElementById("right-container").innerHTML = text

            var inputs = document.getElementsByName("textX");
            for (var i = 0; i < inputs.length; i++) {
                inputs[i].addEventListener("input", function () {
                    onInputEdit()
                })
            }

            var sliders = document.getElementsByClassName("slider");
            for (var i = 0; i < sliders.length; i++) {
                sliders[i].addEventListener("click", function () {
                    onInputEdit()
                })
            }

            var graphDropdown = document.getElementById("graphSelect");
            graphDropdown.value = selectedType
            graphDropdown.addEventListener("change", function () {
                ChangeDetails()
            })
            
            onInputEdit()
        })
    })
}

function ChangeDetails() {

    selectedType = document.getElementById("graphSelect").value

    fetch('/change_details?' + new URLSearchParams({id: currentlySelectedRow, type: document.getElementById("graphSelect").value}))
    .then(function (response) {
        response.text()
        .then(function (text) {
            document.getElementById("right-container").innerHTML = text

            var inputs = document.getElementsByName("textX");
            for (var i = 0; i < inputs.length; i++) {
                inputs[i].addEventListener("input", function () {
                    onInputEdit()
                })
            }

            var sliders = document.getElementsByClassName("slider");
            for (var i = 0; i < sliders.length; i++) {
                sliders[i].addEventListener("click", function () {
                    onInputEdit()
                })
            }

            var graphDropdown = document.getElementById("graphSelect");
            graphDropdown.value = selectedType
            graphDropdown.addEventListener("change", function () {
                ChangeDetails()
            })
            
            onInputEdit()
        })
    })
}