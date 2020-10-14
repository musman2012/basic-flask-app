import csv
import pandas
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

feature_importances = []

def csv_to_dict(csv_contents):
    csv_dict_list = []
    csv_values = csv_contents.values.tolist()
    csv_column_names = csv_contents.columns.tolist()
    for row in csv_values:  #For each row in csv_contents:
        csv_entry_dict = {}
        for i in range(0, len(csv_column_names)):   #For each column in csv_contents:
            csv_entry_dict[csv_column_names[i]] = row[i]
        csv_dict_list.append(csv_entry_dict)
    return csv_dict_list

def run_classifier(target_feature):
    global feature_importances
    #Read csv file
    csv_contents = pandas.read_csv("static/data/vatanen.csv")
    learn_features = []
    #(SPECIFIC) Read desired feature names
    for feature_name in csv_contents.columns.tolist():
        if "k__" in feature_name:
            learn_features.append(feature_name)
            
    #Read csv contents into list of dicts so that reading specific features is made easier
    csv_entries = csv_to_dict(csv_contents)
    
    #Read target_feature and learn_feature entry data into separate arrays for train_test_split
    target_feature_data = []
    learn_features_data = []
    for entry in csv_entries:
        target_feature_data.append(entry[target_feature])
        entry_learn_features_data = [] #List containing the current entry's values for each feature to learn from
        for feature_name in learn_features:
            entry_learn_features_data.append(entry[feature_name])
        learn_features_data.append(entry_learn_features_data)
    
    #Split learn_features_data and target_feature_data into training and testing data sets
    learn_features_train_set, learn_features_test_set, target_feature_train_set, target_feature_test_set = \
        train_test_split(learn_features_data, target_feature_data, test_size=0.5) #70% of given data used for training
    
    rf = RandomForestClassifier(n_estimators=100)
    rf.fit(learn_features_train_set, target_feature_train_set)
    
    feature_importances = pandas.DataFrame(rf.feature_importances_, index = learn_features, \
                            columns = ["importance"]).sort_values("importance", ascending = False)
    
    prediction = rf.predict(learn_features_test_set)
    
    results = { i : str(prediction[i]) for i in range(len(prediction))}
    return results
    
def get_importances(n):
    most_important_features = feature_importances.head(n)
    most_important_feature_names = most_important_features.axes[0].values.tolist()
    importance_values = most_important_features.values.tolist()
    #Flatten list
    importance_values = [value for sublist in importance_values for value in sublist]
    importances = { most_important_feature_names[i] : importance_values[i] for i in range(n)}
    return importances
    
def load_file(file_name):
    file = open(file_name, "r")
    contents = file.read()
    file.close()
    return contents