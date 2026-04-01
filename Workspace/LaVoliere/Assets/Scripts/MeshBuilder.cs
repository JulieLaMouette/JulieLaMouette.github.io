using System.Collections.Generic;
using System.IO;
using System.Linq;

using Unity.Mathematics;

using UnityEditor;

using UnityEngine;

public class MeshBuilder : MonoBehaviour
{
    public Mesh mesh;
    public bool generate;

    private void OnValidate()
    {
        if (generate)
        {
            generate = false;
            Generate();
        }
    }

    [System.Serializable]
    public struct Model
    {
        public string name;
        public float3 position;
        public quaternion rotation;
        public float3 scale;
        public float[] vertices;
        public int[] indices;
        public float[] uv1;
        public float[] uv2;
        public float[] colors;
    }

    private Vector2[] FindPivots(Vector3[] vertices, int[] indices, Color[] colors)
    {
        //Create groups
        int[] groups = new int[vertices.Length];
        for (int i = 0; i < groups.Length; i++)
        {
            groups[i] = i;
        }

        bool changes = true;
        while (changes)
        {
            changes = false;

            for (int i = 0; i < indices.Length; i += 3)
            {
                int a = groups[indices[i]];
                int b = groups[indices[i + 1]];
                int c = groups[indices[i + 2]];

                if (a != b || a != c)
                {
                    groups[indices[i]] = groups[indices[i + 1]] = groups[indices[i + 2]] = Mathf.Min(a, b, c);
                    changes = true;
                }
            }
        }


        //Find pivot
        Dictionary<int, Vector2> groupToPivot = new Dictionary<int, Vector2>();
        for (int i = 0; i < colors.Length; ++i)
        {
            if (colors[i].g > 0.5f)
            {
                if (!groupToPivot.ContainsKey(groups[i]))
                    groupToPivot.Add(groups[i], (Vector2) vertices[i]);
            }
        }

        //Assign pivots to groups
        Vector2[] pivots = new Vector2[groups.Length];
        for (int i = 0; i < pivots.Length; i++)
        {
            if (groupToPivot.ContainsKey(groups[i]))
                pivots[i] = groupToPivot[groups[i]];
        }

        return pivots;
    }

    private void Generate()
    {
        Vector3[] vertices = mesh.vertices;
        int[] indices = mesh.triangles;
        Vector2[] uv1 = mesh.uv;
        Color[] colors = mesh.colors;
        Vector2[] uv2 = FindPivots(vertices, indices, colors);

        if (uv2 == null || uv2.Length != vertices.Length)
            uv2 = new Vector2[vertices.Length];

        if (colors == null || colors.Length != vertices.Length)
            colors = new Color[vertices.Length];

        float[] genVertices = new float[vertices.Length * 3];
        float[] genUv1 = new float[uv1.Length * 2];
        float[] genUv2 = new float[uv2.Length * 2];
        float[] genColors = new float[colors.Length * 4];

        for (int i = 0; i < vertices.Length; i++)
        {
            genVertices[i * 3 + 0] = -vertices[i].x;
            genVertices[i * 3 + 1] = -vertices[i].y;
            genVertices[i * 3 + 2] = -vertices[i].z;

            genUv1[i * 2 + 0] = uv1[i].x;
            genUv1[i * 2 + 1] = uv1[i].y;

            genUv2[i * 2 + 0] = -uv2[i].x;
            genUv2[i * 2 + 1] = -uv2[i].y;

            genColors[i * 4 + 0] = colors[i].r;
            genColors[i * 4 + 1] = colors[i].g;
            genColors[i * 4 + 2] = colors[i].b;
            genColors[i * 4 + 3] = colors[i].a;
        }

        Model model = new Model
        {
            name = mesh.name,
            position = float3.zero,
            rotation = quaternion.identity,
            scale = new float3(1, 1, 1),

            indices = indices,
            vertices = genVertices,
            uv1 = genUv1,
            uv2 = genUv2,
            colors = genColors,
        };

        string file = JsonUtility.ToJson(model, true);
        File.WriteAllText(Application.dataPath + $"/{mesh.name.ToLower()}.mesh", file);
        AssetDatabase.Refresh();
    }
}
