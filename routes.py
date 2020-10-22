from flask import Flask, render_template, send_from_directory, jsonify

app = Flask(__name__)

# two decorators, same function
@app.route('/')
@app.route('/landing_page.html')
def index():
    return render_template('landing_page.html')
# @app.route('/index.html')
# def index():
#     return render_template('index.html', the_title='Health in Yorkshire & Humber')



@app.route('/symbol.html')
def symbol():
    return render_template('symbol.html', the_title='Tiger As Symbol')

@app.route('/myth.html')
def myth():
    return render_template('myth.html', the_title='Tiger in Myth and Legend')

@app.route('/schemaExp.html')
def schemaExp():
    return render_template('schemaExp.html', the_title='Schema Explorer')

@app.route('/RF_classifier.html')
def rf_class():
    return render_template('RF_classifier.html', the_title='Random Forest')

@app.route('/run_RF/<string:target_feature>', methods=['POST'])
def run_RF(target_feature):
    result = run_classifier(target_feature)
    return jsonify(result)
    
@app.route('/importances/<int:number_of_predictors>', methods=['POST'])
def importances(number_of_predictors):
    importances = get_importances(number_of_predictors)
    j = jsonify(importances)
    print("IMPORTANCES:")
    print(importances)
    print("JSON:")
    print(j)
    return j
    
@app.route('/data/<string:file_name>', methods=['GET'])
def load_data_file(file_name):
    return send_from_directory("data", file_name)


if __name__ == '__main__':
    app.run(debug=True)
