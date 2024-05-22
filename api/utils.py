# non-business logic functions, e.g. response normalization, data enrichment, etc.
import numpy as np

# Function to recursively convert NumPy data types to native Python types
def convert_numpy_types(obj):
    if isinstance(obj, dict):
        return {k: convert_numpy_types(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(i) for i in obj]
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, (np.float32, np.float64)):
        return float(obj)
    elif isinstance(obj, (np.int32, np.int64)):
        return int(obj)
    else:
        return obj


# Function to insert entity labels into the original text
def insert_entity_labels(text, entities):
    # Sort entities by their starting position
    entities = sorted(entities, key=lambda x: x['start'])
    
    # Offset to account for text insertions
    offset = 0
    for entity in entities:
        start = entity['start'] + offset
        end = entity['end'] + offset
        # label = entity['entity'].split('-')[-1]  # Extract the label part (e.g., "PER" from "B-PER")
        label = entity['entity']
        
        # Insert the label into the text
        text = text[:end] + f" {label}" + text[end:]
        offset += len(label) + 1  # Update offset to account for the inserted label and space
    
    return text