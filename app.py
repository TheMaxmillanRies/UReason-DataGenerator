import re
from flask import Flask, json, render_template, jsonify, request, current_app
import numpy as np

app = Flask(__name__)

class Entry:
    name = ""
    data = []
    samples = 0
    type = "Sinusoid"

    amplitude = 0
    frequency = 0
    offset = 0
    noise = 0
    slope = 0
    
    amp_slider= 100
    freq_slider = 100
    offset_slider = 100
    noise_slider = 100
    slope_slider = 100

    def __init__(self, new_name, array):
        self.name = new_name
        self.data = array
    
    def reset_all(self):
        self.data = []
        self.samples = 0

        self.amplitude = 0
        self.frequency = 0
        self.offset = 0
        self.noise = 0
        self.slope = 0
        
        self.amp_slider= 100
        self.freq_slider = 100
        self.offset_slider = 100
        self.noise_slider = 100
        self.slope_slider = 100


data_dict = {0 : Entry("Column1", [1,2,3,4]), 1 : Entry("Column2", [5,6,7,8])}

@app.route("/")
def home():
    return render_template("index.html", dictionary=data_dict)

@app.route("/get_data")
def get_data():
    dict_key = request.args.get('id')
    return jsonify({"response" : data_dict[int(dict_key)].data})

@app.route("/add_new")
def add_new_entry():
    data_dict[len(data_dict)] = Entry("NewColumn", [0])
    return jsonify({"response": len(data_dict) - 1})

@app.route("/change_name")
def change_name():
    data_dict[int(request.args.get('id'))].name = request.args.get("new_name")
    print(data_dict[int(request.args.get("id"))].name)
    return jsonify({"response": "Name Changed"})

@app.route('/set_data')
def set_data():
    if (request.args.get('type') == "Sinusoid"):
        data_dict[int(request.args.get('id'))].samples = int(request.args.get('sampleCount'))
        data_dict[int(request.args.get('id'))].amplitude = int(request.args.get('amplitude'))
        data_dict[int(request.args.get('id'))].frequency = int(request.args.get('frequency'))
        data_dict[int(request.args.get('id'))].offset = int(request.args.get('offset'))
        data_dict[int(request.args.get('id'))].noise = float(request.args.get('noise'))

        data_dict[int(request.args.get('id'))].amp_slider = int(request.args.get('amp_slider'))
        data_dict[int(request.args.get('id'))].freq_slider = int(request.args.get('freq_slider'))
        data_dict[int(request.args.get('id'))].offset_slider = int(request.args.get('offset_slider'))
        data_dict[int(request.args.get('id'))].noise_slider = float(request.args.get('noise_slider'))

        t = np.linspace(0, 1, 1*int(request.args.get('sampleCount'))) #linespace of X samples
        x = (int(request.args.get('amplitude')) * int(request.args.get('amp_slider')) / 100)*np.sin(2*np.pi*(int(request.args.get('frequency')) * int(request.args.get('freq_slider')) / 100)*t) + (int(request.args.get('offset')) * int(request.args.get('offset_slider')) / 100)

        noise_array = []
        for i in range(int(request.args.get('sampleCount'))):
            noise_array.append(np.random.uniform(-(float(request.args.get('noise')) * float(request.args.get('noise_slider')) / 100), (float(request.args.get('noise')) * float(request.args.get('noise_slider')) / 100)))
        data_dict[int(request.args.get('id'))].data = x + noise_array

    elif request.args.get('type') == "Linear":

        data_dict[int(request.args.get('id'))].samples = int(request.args.get('sampleCount'))
        data_dict[int(request.args.get('id'))].frequency = int(request.args.get('slope'))
        data_dict[int(request.args.get('id'))].offset = int(request.args.get('offset'))
        data_dict[int(request.args.get('id'))].noise = float(request.args.get('noise'))

        data_dict[int(request.args.get('id'))].freq_slider = int(request.args.get('slope_slider'))
        data_dict[int(request.args.get('id'))].offset_slider = int(request.args.get('offset_slider'))
        data_dict[int(request.args.get('id'))].noise_slider = float(request.args.get('noise_slider'))

        t = np.linspace(0, 1, 1*int(request.args.get('sampleCount'))) #linespace of X samples
        x = (int(request.args.get('slope')) * int(request.args.get('slope_slider')) / 100) * t + (int(request.args.get('offset')) * int(request.args.get('offset_slider')) / 100)

        noise_array = []
        for i in range(int(request.args.get('sampleCount'))):
            noise_array.append(np.random.uniform(-(float(request.args.get('noise')) * float(request.args.get('noise_slider')) / 100), (float(request.args.get('noise')) * float(request.args.get('noise_slider')) / 100)))
        data_dict[int(request.args.get('id'))].data = x + noise_array

    print(data_dict[int(request.args.get('id'))].data)
    return jsonify({"xaxis": list(range(0, int(request.args.get('sampleCount')))), "data": data_dict[int(request.args.get('id'))].data.tolist()})

@app.route("/get_details")
def get_details():
    dict_key = int(request.args.get('id'))

    if data_dict[dict_key].type == "Sinusoid":
        return render_template("Sinusoid.html", selectedType=data_dict[dict_key].type, 
                                    sampleCount=data_dict[dict_key].samples,
                                    amplitude=data_dict[dict_key].amplitude,
                                    amp_slider = data_dict[dict_key].amp_slider,
                                    frequency=data_dict[dict_key].frequency,
                                    freq_slider=data_dict[dict_key].freq_slider,
                                    offset=data_dict[dict_key].offset,
                                    offset_slider=data_dict[dict_key].offset_slider,
                                    noise=data_dict[dict_key].noise,
                                    noise_slider=data_dict[dict_key].noise_slider)
    elif data_dict[dict_key].type == "Linear":
        return render_template("Linear.html", selectedType=data_dict[dict_key].type, 
                                    sampleCount=data_dict[dict_key].samples,
                                    slope=data_dict[dict_key].slope,
                                    slope_slider=data_dict[dict_key].slope_slider,
                                    offset=data_dict[dict_key].offset,
                                    offset_slider=data_dict[dict_key].offset_slider,
                                    noise=data_dict[dict_key].noise,
                                    noise_slider=data_dict[dict_key].noise_slider)

@app.route("/change_details")
def change_details():
    dict_key = int(request.args.get('id'))

    if data_dict[dict_key].type != request.args.get('type'):
        data_dict[dict_key].reset_all()
        data_dict[dict_key].type = request.args.get('type')

    if data_dict[dict_key].type == "Sinusoid":
        return render_template("Sinusoid.html", selected=data_dict[dict_key].type, 
                                    sampleCount=data_dict[dict_key].samples,
                                    amplitude=data_dict[dict_key].amplitude,
                                    amp_slider = data_dict[dict_key].amp_slider,
                                    frequency=data_dict[dict_key].frequency,
                                    freq_slider=data_dict[dict_key].freq_slider,
                                    offset=data_dict[dict_key].offset,
                                    offset_slider=data_dict[dict_key].offset_slider,
                                    noise=data_dict[dict_key].noise,
                                    noise_slider=data_dict[dict_key].noise_slider)
    elif data_dict[dict_key].type == "Linear":
        return render_template("Linear.html", selected=data_dict[dict_key].type, 
                                    sampleCount=data_dict[dict_key].samples,
                                    slope=data_dict[dict_key].slope,
                                    slope_slider=data_dict[dict_key].slope_slider,
                                    offset=data_dict[dict_key].offset,
                                    offset_slider=data_dict[dict_key].offset_slider,
                                    noise=data_dict[dict_key].noise,
                                    noise_slider=data_dict[dict_key].noise_slider)

@app.route("/get_type")
def get_type():
    dict_key = int(request.args.get('id'))
    return jsonify({"type": data_dict[dict_key].type})

if __name__ == "__main__":
    app.run(debug=True)