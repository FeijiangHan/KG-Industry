
import json

with open('./case1.json','r') as load_f:
  jsonData = json.load(load_f)

  links = jsonData['links']
  nodes = jsonData['nodes']
  for index,obj in enumerate(nodes):
    obj['data'] = {'property':None}
  for index,obj in enumerate(links):
    obj['id'] = 'l'+str(index)
  
  with open('./newCase.json','w') as dump_f:
    json.dump(jsonData,dump_f)
