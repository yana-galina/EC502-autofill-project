import json
import pandas as pd


def process(filename):
    data = pd.read_csv(filename, header=None, index_col=0,
                       squeeze=True).to_dict()
    print(data[:10])


if __name__ == "__main__":
    process("websites.txt")
