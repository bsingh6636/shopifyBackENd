
import { MongoClient } from "mongodb";

export const getSalesData = async (req, res, next) => {
  console.log('called')

  const url = process.env.MONGO_URL;
  const dbname = process.env.DB_NAME;
  const client = new MongoClient(url);

  const collectionName = "shopifyOrders";

  try {
    await client.connect();
    console.log('Connected to server');

    const db = client.db(dbname);
    const collection = db.collection(collectionName);
    const documents = await collection.find({}).toArray();

    // Prepare to group data based on the interval
    // const salesData = {};

    // documents.forEach((doc) => {
    //   const createdAt = new Date(doc.created_at);
    //   let groupKey;

    //   switch (interval) {
    //     case "daily":
    //       groupKey = createdAt.toISOString().split('T')[0]; // "YYYY-MM-DD"
    //       break;
    //     case "monthly":
    //       groupKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`; // "YYYY-MM"
    //       break;
    //     case "quarterly":
    //       const quarter = Math.ceil((createdAt.getMonth() + 1) / 3);
    //       groupKey = `${createdAt.getFullYear()}-Q${quarter}`; // "YYYY-QX"
    //       break;
    //     case "yearly":
    //       groupKey = `${createdAt.getFullYear()}`; // "YYYY"
    //       break;
    //     default:
    //       return res.status(400).json({ error: 'Invalid interval specified' });
    //   }

    //   // Sum the sales
    //   const amount = parseFloat(doc.total_price_set.shop_money.amount);
    //   if (salesData[groupKey]) {
    //     salesData[groupKey] += amount;
    //   } else {
    //     salesData[groupKey] = amount;
    //   }
    // });

    // // Convert the result to an array
    // const salesArray = Object.keys(salesData).map((key) => ({
    //   interval: key,
    //   totalSales: salesData[key]
    // }));

    res.json(documents);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  } finally {
    await client.close();
  }
}


export const getSalesGrowthRateOverTime = async (req, res, next) => {
  const { interval } = req.body;

  const url = process.env.MONGO_URL;
  const dbname = process.env.DB_NAME;
  const client = new MongoClient(url);

  const collectionName = "shopifyOrders";

  try {
    await client.connect();
    console.log('Connected to server');

    const db = client.db(dbname);
    const collection = db.collection(collectionName);
    const documents = await collection.find({}).toArray();

    const salesData = {};

    documents.forEach((doc) => {
      const createdAt = new Date(doc.created_at);
      let groupKey;

      switch (interval) {
        case "daily":
          groupKey = createdAt.toISOString().split('T')[0]; // "YYYY-MM-DD"
          break;
        case "monthly":
          groupKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`; // "YYYY-MM"
          break;
        case "quarterly":
          const quarter = Math.ceil((createdAt.getMonth() + 1) / 3);
          groupKey = `${createdAt.getFullYear()}-Q${quarter}`; // "YYYY-QX"
          break;
        case "yearly":
          groupKey = `${createdAt.getFullYear()}`; // "YYYY"
          break;
        default:
          return res.status(400).json({ error: 'Invalid interval specified' });
      }

      const amount = parseFloat(doc.total_price_set.shop_money.amount);
      if (salesData[groupKey]) {
        salesData[groupKey] += amount;
      } else {
        salesData[groupKey] = amount;
      }
    });

    const salesArray = Object.keys(salesData).sort().map((key) => ({
      interval: key,
      totalSales: salesData[key]
    }));

    const growthRateArray = salesArray.map((item, index, arr) => {
      if (index === 0) {
        return {
          interval: item.interval,
          totalSales: item.totalSales,
          growthRate: null  // No previous data to compare
        };
      }
      const previousItem = arr[index - 1];
      const growthRate = ((item.totalSales - previousItem.totalSales) / previousItem.totalSales) * 100;
      return {
        interval: item.interval,
        totalSales: item.totalSales,
        growthRate: growthRate.toFixed(2)  // Round to 2 decimal places
      };
    });

    res.json(growthRateArray);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  } finally {
    await client.close();
  }
};



export const getNewCustomersOverTime = async (req, res, next) => {
  const { interval } = req.body;

  const url = process.env.MONGO_URL;
  const dbname = process.env.DB_NAME;
  const client = new MongoClient(url);

  const collectionName = "shopifyCustomers";

  try {
    await client.connect();
    console.log('Connected to server');

    const db = client.db(dbname);
    const collection = db.collection(collectionName);
    const documents = await collection.find({}).toArray();

    const customerData = {};

    documents.forEach((doc) => {
      const createdAt = new Date(doc.created_at);
      let groupKey;

      switch (interval) {
        case "daily":
          groupKey = createdAt.toISOString().split('T')[0]; // "YYYY-MM-DD"
          break;
        case "monthly":
          groupKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`; // "YYYY-MM"
          break;
        case "quarterly":
          const quarter = Math.ceil((createdAt.getMonth() + 1) / 3);
          groupKey = `${createdAt.getFullYear()}-Q${quarter}`; // "YYYY-QX"
          break;
        case "yearly":
          groupKey = `${createdAt.getFullYear()}`; // "YYYY"
          break;
        default:
          return res.status(400).json({ error: 'Invalid interval specified' });
      }

      if (customerData[groupKey]) {
        customerData[groupKey] += 1;
      } else {
        customerData[groupKey] = 1;
      }
    });

    const newCustomersArray = Object.keys(customerData).sort().map((key) => ({
      interval: key,
      newCustomers: customerData[key]
    }));

    res.json(newCustomersArray);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  } finally {
    await client.close();
  }
};


export const getRepeatCustomersOverTime = async (req, res, next) => {
  const { interval } = req.body;

  const url = process.env.MONGO_URL;
  const dbname = process.env.DB_NAME;
  const client = new MongoClient(url);

  const ordersCollection = "shopifyOrders";

  try {
    await client.connect();
    console.log('Connected to server');

    const db = client.db(dbname);
    const collection = db.collection(ordersCollection);
    const documents = await collection.find({}).toArray();

    const repeatCustomerData = {};

    documents.forEach((doc) => {
      const createdAt = new Date(doc.created_at);
      const customerId = doc.customer?.id;
      if (!customerId) return; // Skip if no customer ID

      let groupKey;

      switch (interval) {
        case "daily":
          groupKey = createdAt.toISOString().split('T')[0]; // "YYYY-MM-DD"
          break;
        case "monthly":
          groupKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`; // "YYYY-MM"
          break;
        case "quarterly":
          const quarter = Math.ceil((createdAt.getMonth() + 1) / 3);
          groupKey = `${createdAt.getFullYear()}-Q${quarter}`; // "YYYY-QX"
          break;
        case "yearly":
          groupKey = `${createdAt.getFullYear()}`; // "YYYY"
          break;
        default:
          return res.status(400).json({ error: 'Invalid interval specified' });
      }

      if (!repeatCustomerData[groupKey]) {
        repeatCustomerData[groupKey] = {};
      }

      if (repeatCustomerData[groupKey][customerId]) {
        repeatCustomerData[groupKey][customerId] += 1;
      } else {
        repeatCustomerData[groupKey][customerId] = 1;
      }
    });

    const repeatCustomersArray = Object.keys(repeatCustomerData).sort().map((key) => {
      const repeatCount = Object.values(repeatCustomerData[key]).filter(count => count > 1).length;
      return {
        interval: key,
        repeatCustomers: repeatCount
      };
    });

    res.json(repeatCustomersArray);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  } finally {
    await client.close();
  }
};


export const getCustomerDistributionByCity = async (req, res, next) => {
  const url = process.env.MONGO_URL;
  const dbname = process.env.DB_NAME;
  const client = new MongoClient(url);

  const collectionName = "shopifyCustomers";

  try {
    await client.connect();
    console.log('Connected to server');

    const db = client.db(dbname);
    const collection = db.collection(collectionName);

    const distribution = await collection.aggregate([
      {
        $group: {
          _id: "$default_address.city",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]).toArray();

    res.json(distribution);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  } finally {
    await client.close();
  }
};


export const getCustomerLifetimeValueByCohort = async (req, res, next) => {
  const url = process.env.MONGO_URL;
  const dbname = process.env.DB_NAME;
  const client = new MongoClient(url);

  const customersCollection = "shopifyCustomers";
  const ordersCollection = "shopifyOrders";

  try {
    await client.connect();
    console.log('Connected to server');

    const db = client.db(dbname);

    // Step 1: Get the first purchase date for each customer
    const firstPurchaseDates = await db.collection(ordersCollection).aggregate([
      {
        $group: {
          _id: "$customer.id",
          firstPurchaseDate: { $min: "$created_at" }
        }
      }
    ]).toArray();

    // Step 2: Group customers by their first purchase month
    const cohorts = firstPurchaseDates.map(item => ({
      customerId: item._id,
      cohort: new Date(item.firstPurchaseDate).toISOString().slice(0, 7) // "YYYY-MM"
    }));

    // Step 3: Calculate the total sales for each cohort
    const cohortSales = await db.collection(ordersCollection).aggregate([
      {
        $lookup: {
          from: customersCollection,
          localField: "customer.id",
          foreignField: "id",
          as: "customerInfo"
        }
      },
      {
        $unwind: "$customerInfo"
      },
      {
        $addFields: {
          cohort: {
            $substr: ["$customerInfo.created_at", 0, 7] // "YYYY-MM"
          }
        }
      },
      {
        $group: {
          _id: "$cohort",
          totalSales: { $sum: { $toDouble: "$total_price" } }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]).toArray();

    res.json(cohortSales);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  } finally {
    await client.close();
  }
};








